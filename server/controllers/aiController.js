const prisma = require('../prisma/client');
const { logAudit } = require('../services/auditService');

async function coach(req, res, next) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      const err = new Error('AI coaching is not configured.');
      err.status = 503;
      throw err;
    }
    const settings = await prisma.systemSetting.findUnique({ where: { key: 'aiCoaching' } });
    const config = { enabled: true, model: 'claude-sonnet-4-20250514', maxTokens: 300, ...(settings?.value || {}) };
    if (!config.enabled) { const err = new Error('AI coaching is disabled.'); err.status = 403; throw err; }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': process.env.ANTHROPIC_VERSION || '2023-06-01',
      },
      body: JSON.stringify({ model: config.model, max_tokens: config.maxTokens, messages: [{ role: 'user', content: req.body.prompt }] }),
    });
    const data = await response.json();
    if (!response.ok) { const err = new Error(data?.error?.message || 'AI provider error.'); err.status = response.status; throw err; }
    await logAudit({ actorId: req.user.id, action: 'AI_COACH_USED', entityType: 'User', entityId: req.user.id, ipAddress: req.ip, metadata: { model: config.model, usage: data.usage } });
    res.json({ tip: data.content?.map((block) => block.text || '').join('') || '', usage: data.usage });
  } catch (e) { next(e); }
}

module.exports = { coach };
