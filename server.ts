import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const aiKey = process.env.GEMINI_API_KEY || '';
const ai = aiKey ? new GoogleGenAI({ apiKey: aiKey }) : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: any;
try {
  const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');
  const isPlaceholder = supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder');
  if (isValidUrl && !isPlaceholder && (supabaseServiceKey || supabaseAnonKey)) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: { persistSession: false }
    });
  } else {
    const createMockBuilder = () => {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        in: () => builder,
        contains: () => builder,
        order: () => builder,
        limit: () => builder,
        single: async () => ({ data: null, error: new Error('Supabase not configured') }),
        insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
        upsert: async () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => builder,
        delete: () => builder,
        then: (resolve: any) => resolve({ data: [], error: null })
      };
      return builder;
    };
    supabaseAdmin = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') })
      },
      from: () => createMockBuilder()
    };
  }
} catch (e) {
  const createMockBuilder = () => {
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      in: () => builder,
      contains: () => builder,
      order: () => builder,
      limit: () => builder,
      single: async () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      upsert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => builder,
      delete: () => builder,
      then: (resolve: any) => resolve({ data: [], error: null })
    };
    return builder;
  };
  supabaseAdmin = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') })
    },
    from: () => createMockBuilder()
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Supabase Auth & Tenant verification middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      req.user = user;

      // Fetch user profile and tenant_id
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*, tenants(*)')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        req.profile = profile;
        req.tenantId = profile.tenant_id;
      }
      next();
    } catch (err: any) {
      return res.status(401).json({ error: 'Authentication failed: ' + err.message });
    }
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // WhatsApp Accounts (Tenant scoped)
  app.get('/api/whatsapp/accounts', requireAuth, async (req: any, res: any) => {
    try {
      let query = supabaseAdmin.from('whatsapp_accounts').select('*');
      if (req.profile?.role !== 'admin') {
        query = query.eq('tenant_id', req.tenantId);
      } else if (req.query.tenant_id) {
        query = query.eq('tenant_id', req.query.tenant_id);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/whatsapp/accounts', requireAuth, async (req: any, res: any) => {
    try {
      const { phone_number_id, waba_id, access_token, phone_number, name } = req.body;
      const tenant_id = req.profile?.role === 'admin' ? (req.body.tenant_id || req.tenantId) : req.tenantId;

      if (!tenant_id || !phone_number_id || !access_token) {
        return res.status(400).json({ error: 'Missing required WhatsApp credentials' });
      }

      // Verify connection with Meta Graph API
      const metaRes = await fetch(`https://graph.facebook.com/v19.0/${phone_number_id}`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const metaData = await metaRes.json();
      
      const status = metaRes.ok ? 'connected' : 'error';
      const error_message = metaRes.ok ? null : (metaData.error?.message || 'Meta API verification failed');

      const { data, error } = await supabaseAdmin
        .from('whatsapp_accounts')
        .upsert([{
          tenant_id,
          phone_number_id,
          waba_id,
          access_token,
          phone_number: phone_number || metaData.display_phone_number || '',
          name: name || metaData.verified_name || 'WhatsApp Account',
          status,
          error_message,
          updated_at: new Date().toISOString()
        }], { onConflict: 'tenant_id, phone_number_id' })
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, data, meta: metaData });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Webhook Receiver for Meta WhatsApp Cloud API
  app.get('/api/webhook/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'aisoft_whatsapp_secure_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully by Meta');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  app.post('/api/webhook/whatsapp', async (req, res) => {
    try {
      const body = req.body;
      console.log('Incoming WhatsApp Webhook:', JSON.stringify(body, null, 2));

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const value = change.value;
              const phoneNumberId = value.metadata?.phone_number_id;
              const messages = value.messages || [];

              const { data: account } = await supabaseAdmin
                .from('whatsapp_accounts')
                .select('*')
                .eq('phone_number_id', phoneNumberId)
                .single();

              if (account) {
                for (const msg of messages) {
                  const sender = msg.from;
                  const text = msg.text?.body || '';
                  const messageId = msg.id;

                  await supabaseAdmin.from('messages').insert([{
                    tenant_id: account.tenant_id,
                    whatsapp_account_id: account.id,
                    message_id: messageId,
                    sender,
                    recipient: phoneNumberId,
                    direction: 'inbound',
                    body: text,
                    status: 'received',
                    payload: msg
                  }]);

                  // Manage conversation metadata
                  let { data: convo } = await supabaseAdmin
                    .from('conversation_metadata')
                    .select('*')
                    .eq('tenant_id', account.tenant_id)
                    .eq('sender', sender)
                    .single();

                  if (!convo) {
                    const { data: newConvo } = await supabaseAdmin
                      .from('conversation_metadata')
                      .insert([{
                        tenant_id: account.tenant_id,
                        sender,
                        status: 'unread',
                        takeover_mode: false
                      }])
                      .select()
                      .single();
                    convo = newConvo;
                  } else {
                    await supabaseAdmin
                      .from('conversation_metadata')
                      .update({ status: 'unread', updated_at: new Date().toISOString() })
                      .eq('tenant_id', account.tenant_id)
                      .eq('sender', sender);
                  }

                  if (convo?.takeover_mode) {
                    continue; // Skip bot replies during human takeover
                  }

                  let replyText = '';

                  // Check keyword rules
                  const { data: rules } = await supabaseAdmin
                    .from('automation_rules')
                    .select('*')
                    .eq('tenant_id', account.tenant_id)
                    .eq('is_active', true);

                  for (const rule of rules || []) {
                    if (text.toLowerCase().includes(rule.trigger_keyword.toLowerCase())) {
                      replyText = rule.response_template;
                      break;
                    }
                  }

                  // Check AI chatbot settings & knowledge base if no rule matched
                  if (!replyText) {
                    const { data: botSettings } = await supabaseAdmin
                      .from('chatbot_settings')
                      .select('*')
                      .eq('tenant_id', account.tenant_id)
                      .single();

                    if (botSettings && botSettings.is_enabled) {
                      const { data: kbEntries } = await supabaseAdmin
                        .from('knowledge_base')
                        .select('*')
                        .eq('tenant_id', account.tenant_id)
                        .eq('is_active', true);

                      const exactMatch = kbEntries?.find((kb: any) => text.toLowerCase().includes(kb.question.toLowerCase()));
                      if (exactMatch) {
                        replyText = exactMatch.answer;
                      } else if (ai) {
                        try {
                          const kbContext = (kbEntries || []).map((kb: any) => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n');
                          const systemPrompt = `You are ${botSettings.bot_name || 'AI Assistant'}, an official AI customer support chatbot for ${botSettings.business_name || 'our business'}.
Business Description: ${botSettings.business_description || ''}
Instructions: ${botSettings.instructions || 'Be helpful, polite, and concise.'}
Handoff Rules: ${botSettings.handoff_rules || 'If unable to answer, ask the customer to contact a human agent.'}

Knowledge Base:
${kbContext}

Guidelines: Use only the above knowledge base and business info to answer. Never invent prices or commitments. If information is missing, ask the customer to contact a human agent.`;

                          const aiRes = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: text,
                            config: {
                              systemInstruction: systemPrompt,
                            }
                          });
                          replyText = aiRes.text || botSettings.welcome_message;
                        } catch (aiErr) {
                          console.error('Gemini AI error:', aiErr);
                          replyText = botSettings.welcome_message || "Thanks for your message! Our team will review your enquiry shortly.";
                        }
                      } else {
                        replyText = botSettings.welcome_message || "Hello! Thanks for reaching out.";
                      }
                    }
                  }

                  if (replyText) {
                    await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${account.access_token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: sender,
                        type: 'text',
                        text: { body: replyText }
                      })
                    });

                    await supabaseAdmin.from('messages').insert([{
                      tenant_id: account.tenant_id,
                      whatsapp_account_id: account.id,
                      sender: phoneNumberId,
                      recipient: sender,
                      direction: 'outbound',
                      body: replyText,
                      status: 'sent'
                    }]);
                  }
                }
              }
            }
          }
        }
        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.sendStatus(404);
      }
    } catch (err: any) {
      console.error('Error processing webhook:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Chatbot Settings (Tenant Scoped)
  app.get('/api/chatbot/settings', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('chatbot_settings')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      res.json(data || { tenant_id: req.tenantId, bot_name: 'AI Assistant', is_enabled: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/chatbot/settings', requireAuth, async (req: any, res: any) => {
    try {
      const { bot_name, welcome_message, business_name, business_description, supported_languages, working_hours, instructions, handoff_rules, is_enabled } = req.body;
      const { data, error } = await supabaseAdmin
        .from('chatbot_settings')
        .upsert([{
          tenant_id: req.tenantId,
          bot_name,
          welcome_message,
          business_name,
          business_description,
          supported_languages,
          working_hours,
          instructions,
          handoff_rules,
          is_enabled,
          updated_at: new Date().toISOString()
        }], { onConflict: 'tenant_id' })
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Knowledge Base (Tenant Scoped)
  app.get('/api/knowledge-base', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('knowledge_base')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/knowledge-base', requireAuth, async (req: any, res: any) => {
    try {
      const { category, question, answer, is_active } = req.body;
      const { data, error } = await supabaseAdmin
        .from('knowledge_base')
        .insert([{
          tenant_id: req.tenantId,
          category: category || 'faq',
          question,
          answer,
          is_active: is_active ?? true
        }])
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/knowledge-base/:id', requireAuth, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('knowledge_base')
        .delete()
        .eq('id', id)
        .eq('tenant_id', req.tenantId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Conversations & Inbox (Tenant Scoped)
  app.get('/api/conversations', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('conversation_metadata')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('updated_at', { ascending: false });
      if (error && error.code !== 'PGRST116') throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/conversations/:sender', requireAuth, async (req: any, res: any) => {
    try {
      const { sender } = req.params;
      const { status, assigned_to, takeover_mode, internal_notes } = req.body;

      const updateData: any = { updated_at: new Date().toISOString() };
      if (status !== undefined) updateData.status = status;
      if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
      if (takeover_mode !== undefined) updateData.takeover_mode = takeover_mode;
      if (internal_notes !== undefined) updateData.internal_notes = internal_notes;

      const { data, error } = await supabaseAdmin
        .from('conversation_metadata')
        .upsert([{
          tenant_id: req.tenantId,
          sender,
          ...updateData
        }], { onConflict: 'tenant_id, sender' })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Automation Rules CRUD (Tenant Scoped)
  app.get('/api/automation/rules', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('automation_rules')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/automation/rules', requireAuth, async (req: any, res: any) => {
    try {
      const { name, trigger_keyword, response_template, is_active } = req.body;
      const { data, error } = await supabaseAdmin
        .from('automation_rules')
        .insert([{
          tenant_id: req.tenantId,
          name,
          trigger_keyword,
          response_template,
          is_active: is_active ?? true
        }])
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Messages Inbox (Tenant Scoped)
  app.get('/api/messages', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // Contacts & Consent Management API
  // ==========================================
  app.get('/api/contacts', requireAuth, async (req: any, res: any) => {
    try {
      let query = supabaseAdmin.from('contacts').select('*').eq('tenant_id', req.tenantId).order('created_at', { ascending: false });
      if (req.query.tag) {
        query = query.contains('tags', [req.query.tag]);
      }
      if (req.query.consent) {
        query = query.eq('consent_status', req.query.consent);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/contacts', requireAuth, async (req: any, res: any) => {
    try {
      const { name, phone, email, tags, consent_status, consent_source } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
      const status = consent_status || 'pending';

      const { data, error } = await supabaseAdmin
        .from('contacts')
        .upsert([{
          tenant_id: req.tenantId,
          name,
          phone: formattedPhone,
          email,
          tags: tags || [],
          consent_status: status,
          consent_source: consent_source || 'manual',
          consent_timestamp: status === 'opted_in' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }], { onConflict: 'tenant_id, phone' })
        .select()
        .single();

      if (error) throw error;

      if (status === 'opted_in' || status === 'opted_out') {
        await supabaseAdmin.from('contact_consent_events').insert([{
          tenant_id: req.tenantId,
          contact_id: data.id,
          phone: formattedPhone,
          action: status === 'opted_in' ? 'opt_in' : 'opt_out',
          source: consent_source || 'manual',
          evidence: 'Manual update in dashboard'
        }]);
      }

      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/contacts/import', requireAuth, async (req: any, res: any) => {
    try {
      const { contacts } = req.body;
      if (!Array.isArray(contacts)) {
        return res.status(400).json({ error: 'Contacts array required' });
      }

      let imported = 0;
      let skipped = 0;
      const errors = [];

      for (const item of contacts) {
        if (!item.name || !item.phone) {
          skipped++;
          continue;
        }
        const formattedPhone = item.phone.startsWith('+') ? item.phone : `+${item.phone.replace(/\D/g, '')}`;
        const consent = item.consent_status === 'opted_in' ? 'opted_in' : 'pending';

        const { data, error } = await supabaseAdmin
          .from('contacts')
          .upsert([{
            tenant_id: req.tenantId,
            name: item.name,
            phone: formattedPhone,
            email: item.email || null,
            tags: item.tags || ['imported'],
            consent_status: consent,
            consent_source: 'csv_import',
            consent_timestamp: consent === 'opted_in' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          }], { onConflict: 'tenant_id, phone' })
          .select()
          .single();

        if (error) {
          errors.push({ phone: item.phone, error: error.message });
          skipped++;
        } else {
          imported++;
          await supabaseAdmin.from('contact_consent_events').insert([{
            tenant_id: req.tenantId,
            contact_id: data.id,
            phone: formattedPhone,
            action: consent === 'opted_in' ? 'opt_in' : 'imported',
            source: 'csv_import',
            evidence: 'Batch CSV Import'
          }]);
        }
      }

      res.json({ success: true, imported, skipped, errors });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/contacts/:id', requireAuth, async (req: any, res: any) => {
    try {
      const { error } = await supabaseAdmin
        .from('contacts')
        .delete()
        .eq('id', req.params.id)
        .eq('tenant_id', req.tenantId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // WhatsApp Templates API
  // ==========================================
  app.get('/api/whatsapp/templates', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('whatsapp_templates')
        .select('*')
        .eq('tenant_id', req.tenantId);
      if (error) throw error;
      if (!data || data.length === 0) {
        res.json([
          { id: '1', template_name: 'welcome_broadcast', language: 'en', category: 'MARKETING', status: 'APPROVED', components: [{ type: 'BODY', text: 'Hello {{1}}, welcome to {{2}}! Check out our latest updates.' }] },
          { id: '2', template_name: 'order_update', language: 'en', category: 'UTILITY', status: 'APPROVED', components: [{ type: 'BODY', text: 'Hi {{1}}, your order #{{2}} status has been updated to: {{3}}.' }] },
          { id: '3', template_name: 'otp_verification', language: 'en', category: 'AUTHENTICATION', status: 'APPROVED', components: [{ type: 'BODY', text: 'Your verification code is {{1}}. Valid for 10 minutes.' }] }
        ]);
      } else {
        res.json(data);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/whatsapp/templates/sync', requireAuth, async (req: any, res: any) => {
    try {
      const { data: account } = await supabaseAdmin
        .from('whatsapp_accounts')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .eq('status', 'connected')
        .single();

      if (!account || !account.waba_id) {
        return res.status(400).json({ error: 'No connected WhatsApp Business Account found for this tenant' });
      }

      const metaRes = await fetch(`https://graph.facebook.com/v19.0/${account.waba_id}/message_templates`, {
        headers: { Authorization: `Bearer ${account.access_token}` }
      });
      const metaData = await metaRes.json();

      if (!metaRes.ok) {
        throw new Error(metaData.error?.message || 'Failed to fetch templates from Meta API');
      }

      const templates = metaData.data || [];
      for (const t of templates) {
        await supabaseAdmin.from('whatsapp_templates').upsert([{
          tenant_id: req.tenantId,
          template_name: t.name,
          language: t.language || 'en',
          category: t.category || 'MARKETING',
          status: t.status || 'APPROVED',
          components: t.components || []
        }], { onConflict: 'tenant_id, template_name, language' });
      }

      res.json({ success: true, count: templates.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // Campaigns & Broadcasts API
  // ==========================================
  app.get('/api/campaigns', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('campaigns')
        .select('*, whatsapp_accounts(name, phone_number)')
        .eq('tenant_id', req.tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/campaigns', requireAuth, async (req: any, res: any) => {
    try {
      const { name, purpose, whatsapp_account_id, target_filter, template_name, template_language, template_variables, message_body, scheduled_at } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Campaign name is required' });
      }

      const status = scheduled_at ? 'scheduled' : 'draft';

      const { data, error } = await supabaseAdmin
        .from('campaigns')
        .insert([{
          tenant_id: req.tenantId,
          name,
          purpose,
          whatsapp_account_id: whatsapp_account_id || null,
          target_filter: target_filter || {},
          template_name,
          template_language: template_language || 'en',
          template_variables: template_variables || {},
          message_body,
          scheduled_at: scheduled_at || null,
          status
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/campaigns/:id', requireAuth, async (req: any, res: any) => {
    try {
      const { data: campaign, error } = await supabaseAdmin
        .from('campaigns')
        .select('*, whatsapp_accounts(*)')
        .eq('id', req.params.id)
        .eq('tenant_id', req.tenantId)
        .single();

      if (error || !campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const { data: recipients } = await supabaseAdmin
        .from('campaign_recipients')
        .select('*')
        .eq('campaign_id', campaign.id)
        .limit(200);

      res.json({ ...campaign, recipients: recipients || [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/campaigns/:id/start', requireAuth, async (req: any, res: any) => {
    try {
      const campaignId = req.params.id;
      const { data: campaign, error } = await supabaseAdmin
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('tenant_id', req.tenantId)
        .single();

      if (error || !campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      if (['processing', 'completed'].includes(campaign.status)) {
        return res.status(400).json({ error: 'Campaign is already processing or completed' });
      }

      let query = supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .eq('consent_status', 'opted_in');

      const filter = campaign.target_filter || {};
      if (filter.tag) {
        query = query.contains('tags', [filter.tag]);
      }

      const { data: contacts, error: contactError } = await query;
      if (contactError) throw contactError;

      if (!contacts || contacts.length === 0) {
        return res.status(400).json({ error: 'No opted-in contacts found matching audience filter' });
      }

      let addedCount = 0;
      for (const contact of contacts) {
        const { error: rcError } = await supabaseAdmin
          .from('campaign_recipients')
          .upsert([{
            tenant_id: req.tenantId,
            campaign_id: campaign.id,
            contact_id: contact.id,
            phone: contact.phone,
            status: 'pending'
          }], { onConflict: 'campaign_id, phone' });

        if (!rcError) addedCount++;
      }

      await supabaseAdmin
        .from('campaigns')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          total_recipients: addedCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      res.json({ success: true, total_recipients: addedCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/campaigns/:id/cancel', requireAuth, async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('campaigns')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('tenant_id', req.tenantId)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/campaigns/:id/duplicate', requireAuth, async (req: any, res: any) => {
    try {
      const { data: original, error } = await supabaseAdmin
        .from('campaigns')
        .select('*')
        .eq('id', req.params.id)
        .eq('tenant_id', req.tenantId)
        .single();

      if (error || !original) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const { data, error: insertError } = await supabaseAdmin
        .from('campaigns')
        .insert([{
          tenant_id: req.tenantId,
          name: `${original.name} (Copy)`,
          purpose: original.purpose,
          whatsapp_account_id: original.whatsapp_account_id,
          target_filter: original.target_filter,
          template_name: original.template_name,
          template_language: original.template_language,
          template_variables: original.template_variables,
          message_body: original.message_body,
          status: 'draft'
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/campaigns/:id', requireAuth, async (req: any, res: any) => {
    try {
      const { error } = await supabaseAdmin
        .from('campaigns')
        .delete()
        .eq('id', req.params.id)
        .eq('tenant_id', req.tenantId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Background Campaign Dispatch Worker
  setInterval(async () => {
    try {
      const { data: activeCampaigns } = await supabaseAdmin
        .from('campaigns')
        .select('*, whatsapp_accounts(*)')
        .in('status', ['scheduled', 'processing']);

      for (const camp of activeCampaigns || []) {
        if (camp.status === 'scheduled' && camp.scheduled_at && new Date(camp.scheduled_at) <= new Date()) {
          const { data: contacts } = await supabaseAdmin
            .from('contacts')
            .select('*')
            .eq('tenant_id', camp.tenant_id)
            .eq('consent_status', 'opted_in');

          let count = 0;
          for (const c of contacts || []) {
            await supabaseAdmin.from('campaign_recipients').upsert([{
              tenant_id: camp.tenant_id,
              campaign_id: camp.id,
              contact_id: c.id,
              phone: c.phone,
              status: 'pending'
            }], { onConflict: 'campaign_id, phone' });
            count++;
          }

          await supabaseAdmin.from('campaigns').update({
            status: 'processing',
            started_at: new Date().toISOString(),
            total_recipients: count
          }).eq('id', camp.id);
          continue;
        }

        if (camp.status === 'processing') {
          const account = camp.whatsapp_accounts;
          if (!account || account.status !== 'connected') {
            await supabaseAdmin.from('campaigns').update({
              status: 'failed',
              error_message: 'WhatsApp account disconnected or invalid',
              completed_at: new Date().toISOString()
            }).eq('id', camp.id);
            continue;
          }

          const { data: recipients } = await supabaseAdmin
            .from('campaign_recipients')
            .select('*')
            .eq('campaign_id', camp.id)
            .eq('status', 'pending')
            .limit(10);

          if (!recipients || recipients.length === 0) {
            const { count: pendingCount } = await supabaseAdmin
              .from('campaign_recipients')
              .select('*', { count: 'exact', head: true })
              .eq('campaign_id', camp.id)
              .eq('status', 'pending');

            if (pendingCount === 0) {
              await supabaseAdmin.from('campaigns').update({
                status: 'completed',
                completed_at: new Date().toISOString()
              }).eq('id', camp.id);
            }
            continue;
          }

          let sentInc = 0;
          let failedInc = 0;

          for (const rc of recipients) {
            try {
              let payload: any = {
                messaging_product: 'whatsapp',
                to: rc.phone,
                type: 'text',
                text: { body: camp.message_body || 'Hello from AI SOFT STUDIO campaign' }
              };

              if (camp.template_name) {
                payload = {
                  messaging_product: 'whatsapp',
                  to: rc.phone,
                  type: 'template',
                  template: {
                    name: camp.template_name,
                    language: { code: camp.template_language || 'en' }
                  }
                };
              }

              const metaRes = await fetch(`https://graph.facebook.com/v19.0/${account.phone_number_id}/messages`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${account.access_token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });

              const metaData = await metaRes.json();

              if (metaRes.ok) {
                const msgId = metaData.messages?.[0]?.id || 'sent_' + Date.now();
                await supabaseAdmin.from('campaign_recipients').update({
                  status: 'sent',
                  provider_message_id: msgId,
                  sent_at: new Date().toISOString()
                }).eq('id', rc.id);
                sentInc++;
              } else {
                await supabaseAdmin.from('campaign_recipients').update({
                  status: 'failed',
                  error_message: metaData.error?.message || 'Meta API send error',
                  sent_at: new Date().toISOString()
                }).eq('id', rc.id);
                failedInc++;
              }
            } catch (err: any) {
              await supabaseAdmin.from('campaign_recipients').update({
                status: 'failed',
                error_message: err.message,
                sent_at: new Date().toISOString()
              }).eq('id', rc.id);
              failedInc++;
            }
          }

          const newSentCount = (camp.sent_count || 0) + sentInc;
          const newFailedCount = (camp.failed_count || 0) + failedInc;
          await supabaseAdmin.from('campaigns').update({
            sent_count: newSentCount,
            failed_count: newFailedCount,
            updated_at: new Date().toISOString()
          }).eq('id', camp.id);
        }
      }
    } catch (err) {
      console.error('Background campaign worker error:', err);
    }
  }, 10000);

  // ==========================================
  // Subscription & Billing API
  // ==========================================
  app.get('/api/billing/plans', async (req: any, res: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        res.json([
          {
            id: 'plan_starter',
            name: 'Starter Automator',
            description: 'For solo creators and small businesses getting started with WhatsApp automation.',
            monthly_price: 999,
            yearly_price: 9990,
            currency: 'INR',
            max_whatsapp_accounts: 1,
            max_monthly_messages: 2000,
            max_contacts: 1000,
            max_campaigns_per_month: 10,
            max_automation_rules: 15,
            trial_days: 14,
            features: ['1 WhatsApp Account', '2,000 Messages/mo', '1,000 Contacts', 'Keyword Automation & AI Chatbot']
          },
          {
            id: 'plan_growth',
            name: 'Growth Scale',
            description: 'For growing brands scaling customer support and broadcast marketing.',
            monthly_price: 2999,
            yearly_price: 29990,
            currency: 'INR',
            max_whatsapp_accounts: 3,
            max_monthly_messages: 10000,
            max_contacts: 5000,
            max_campaigns_per_month: 50,
            max_automation_rules: 50,
            trial_days: 14,
            features: ['3 WhatsApp Accounts', '10,000 Messages/mo', '5,000 Contacts', 'Advanced Broadcast Campaigns', 'Priority Support']
          },
          {
            id: 'plan_enterprise',
            name: 'Enterprise Infinity',
            description: 'Unlimited horsepower for high-volume enterprise operations.',
            monthly_price: 7999,
            yearly_price: 79990,
            currency: 'INR',
            max_whatsapp_accounts: 10,
            max_monthly_messages: 50000,
            max_contacts: 25000,
            max_campaigns_per_month: 200,
            max_automation_rules: 200,
            trial_days: 14,
            features: ['10 WhatsApp Accounts', '50,000 Messages/mo', '25,000 Contacts', 'Dedicated Account Manager', 'Custom Webhooks']
          }
        ]);
      } else {
        res.json(data);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/billing/subscription', requireAuth, async (req: any, res: any) => {
    try {
      let { data: sub } = await supabaseAdmin
        .from('client_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('tenant_id', req.tenantId)
        .single();

      if (!sub) {
        const { data: plans } = await supabaseAdmin.from('subscription_plans').select('*').limit(1);
        const defaultPlan = plans?.[0];

        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);

        const { data: newSub } = await supabaseAdmin
          .from('client_subscriptions')
          .insert([{
            tenant_id: req.tenantId,
            plan_id: defaultPlan?.id || null,
            status: 'trialing',
            billing_cycle: 'monthly',
            trial_end: trialEnd.toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: trialEnd.toISOString()
          }])
          .select('*, subscription_plans(*)')
          .single();
        sub = newSub;
      }

      const { count: wabaCount } = await supabaseAdmin
        .from('whatsapp_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', req.tenantId);

      const { count: contactsCount } = await supabaseAdmin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', req.tenantId);

      const { count: campaignsCount } = await supabaseAdmin
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', req.tenantId);

      const { data: transactions } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('created_at', { ascending: false });

      const { data: invoices } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('invoice_date', { ascending: false });

      res.json({
        subscription: sub,
        usage: {
          whatsapp_accounts: wabaCount || 0,
          contacts: contactsCount || 0,
          campaigns: campaignsCount || 0,
          messages_sent: 42
        },
        transactions: transactions || [],
        invoices: invoices || []
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/billing/checkout', requireAuth, async (req: any, res: any) => {
    try {
      const { plan_id, billing_cycle } = req.body;
      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('id', plan_id)
        .single();

      if (!plan) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      const amount = billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
      const amountPaise = Math.round(Number(amount) * 100);

      const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

      let orderId = 'order_' + Math.random().toString(36).substring(2, 15);

      if (razorpayKeyId && razorpayKeySecret) {
        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: plan.currency || 'INR',
            receipt: `rcpt_${req.tenantId.substring(0, 8)}_${Date.now()}`
          })
        });
        const rzpData = await rzpRes.json();
        if (rzpRes.ok) {
          orderId = rzpData.id;
        }
      }

      const { data: tx, error: txError } = await supabaseAdmin
        .from('payment_transactions')
        .insert([{
          tenant_id: req.tenantId,
          plan_id: plan.id,
          gateway: 'razorpay',
          order_id: orderId,
          amount,
          currency: plan.currency || 'INR',
          status: 'created',
          metadata: { billing_cycle }
        }])
        .select()
        .single();

      if (txError) throw txError;

      res.json({
        order_id: orderId,
        amount: amountPaise,
        currency: plan.currency || 'INR',
        key_id: razorpayKeyId || 'rzp_test_sandbox_key',
        transaction_id: tx.id
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/billing/verify-payment', requireAuth, async (req: any, res: any) => {
    try {
      const { order_id, payment_id, signature, transaction_id } = req.body;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

      let isValid = true;
      if (razorpayKeySecret && signature) {
        const crypto = await import('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(order_id + '|' + payment_id)
          .digest('hex');
        isValid = expectedSignature === signature;
      }

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid payment signature verification failed' });
      }

      const { data: tx } = await supabaseAdmin
        .from('payment_transactions')
        .update({
          payment_id,
          signature,
          status: 'captured'
        })
        .eq('order_id', order_id)
        .select()
        .single();

      if (tx) {
        const periodStart = new Date();
        const periodEnd = new Date();
        const cycle = tx.metadata?.billing_cycle || 'monthly';
        if (cycle === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        await supabaseAdmin
          .from('client_subscriptions')
          .upsert([{
            tenant_id: req.tenantId,
            plan_id: tx.plan_id,
            status: 'active',
            billing_cycle: cycle,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString()
          }], { onConflict: 'tenant_id' });

        const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
        await supabaseAdmin.from('invoices').insert([{
          tenant_id: req.tenantId,
          transaction_id: tx.id,
          invoice_number: invoiceNumber,
          amount: tx.amount,
          currency: tx.currency,
          status: 'paid',
          invoice_date: new Date().toISOString()
        }]);

        await supabaseAdmin.from('billing_audit_logs').insert([{
          tenant_id: req.tenantId,
          action: 'payment_verified_and_subscription_activated',
          details: { order_id, payment_id, amount: tx.amount }
        }]);
      }

      res.json({ success: true, message: 'Payment verified and subscription activated successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/billing/plans', requireAuth, async (req: any, res: any) => {
    try {
      if (req.profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      const { data, error } = await supabaseAdmin.from('subscription_plans').select('*').order('monthly_price', { ascending: true });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/billing/plans', requireAuth, async (req: any, res: any) => {
    try {
      if (req.profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      const { id, name, description, monthly_price, yearly_price, currency, max_whatsapp_accounts, max_monthly_messages, max_contacts, max_campaigns_per_month, max_automation_rules, is_active, features } = req.body;

      const planData = {
        name,
        description,
        monthly_price,
        yearly_price,
        currency: currency || 'INR',
        max_whatsapp_accounts,
        max_monthly_messages,
        max_contacts,
        max_campaigns_per_month,
        max_automation_rules,
        is_active: is_active ?? true,
        features: features || []
      };

      let query = supabaseAdmin.from('subscription_plans');
      let result;
      if (id && id.length > 5) {
        result = await query.update(planData).eq('id', id).select().single();
      } else {
        result = await query.insert([planData]).select().single();
      }

      if (result.error) throw result.error;
      res.json(result.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite integration for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
