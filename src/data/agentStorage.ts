import { AgentProfile } from '../types/agentMerchant.ts';

export const AGENTS_STORAGE_KEY = 'uwallet_agents_list_v1';
export const AGENT_SESSION_STORAGE_KEY = 'uwallet_active_agent_session_v2';

export const INITIAL_AGENTS_LIST: AgentProfile[] = [
  {
    id: 'agt-882',
    agentName: 'আজিম টেলিকম & মেগা ডিলারশিপ',
    ownerName: 'মো: আরিয়ান আজিম',
    agentPhone: '01739-420736',
    outletName: 'দোকান নং ১২, মিরপুর ১০ সার্কেল, ঢাকা',
    outletLocation: 'ঢাকা উত্তর',
    floatBalance: 50000,
    securityDeposit: 10000,
    bonusBalance: 2000,
    dailyLimit: 50000,
    usedLimitToday: 14250,
    commissionEarnedToday: 2150,
    totalCommissionBalance: 16800,
    status: 'active',
    activatedAt: '2025-01-10',
    nidNumber: '1995267182910',
  },
  {
    id: 'agt-881',
    agentName: 'মায়ের দোয়া টেলিকম & এন্টারপ্রাইজ',
    ownerName: 'সুফিয়ান হাওলাদার',
    agentPhone: '01700-112233',
    outletName: 'শপ #০৫, মিরপুর ১০ গোলচত্বর, ঢাকা',
    outletLocation: 'ঢাকা উত্তর',
    floatBalance: 45000,
    securityDeposit: 5000,
    bonusBalance: 1500,
    dailyLimit: 50000,
    usedLimitToday: 9800,
    commissionEarnedToday: 1850,
    totalCommissionBalance: 14250,
    status: 'active',
    activatedAt: '2025-01-15',
    nidNumber: '1992261890123',
  },
  {
    id: 'agt-883',
    agentName: 'সততা টেলিকম সার্ভিস',
    ownerName: 'মো: কামরুল হাসান',
    agentPhone: '01819-556677',
    outletName: 'স্টেশন রোড, নিউ মার্কেট, চট্টগ্রাম',
    outletLocation: 'চট্টগ্রাম সদর',
    floatBalance: 32000,
    securityDeposit: 5000,
    bonusBalance: 1000,
    dailyLimit: 50000,
    usedLimitToday: 7600,
    commissionEarnedToday: 1200,
    totalCommissionBalance: 9800,
    status: 'active',
    activatedAt: '2025-02-01',
    nidNumber: '1990267711200',
  },
  {
    id: 'agt-884',
    agentName: 'কর্ণফুলী এন্টারপ্রাইজ & ডিলারশিপ',
    ownerName: 'মো: শাহরিয়ার কবির',
    agentPhone: '01911-334455',
    outletName: 'আগ্রাবাদ বাণিজ্যিক এলাকা, চট্টগ্রাম',
    outletLocation: 'চট্টগ্রাম কমার্শিয়াল এরিয়া',
    floatBalance: 75000,
    securityDeposit: 15000,
    bonusBalance: 3000,
    dailyLimit: 75000,
    usedLimitToday: 18500,
    commissionEarnedToday: 3400,
    totalCommissionBalance: 24500,
    status: 'active',
    activatedAt: '2025-02-14',
    nidNumber: '1988267339011',
  },
];

export function loadAgentsList(): AgentProfile[] {
  try {
    const raw = localStorage.getItem(AGENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading agents list:', e);
  }

  // Seed initial list
  try {
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(INITIAL_AGENTS_LIST));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_AGENTS_LIST;
}

export function saveAgentsList(agents: AgentProfile[]): void {
  try {
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
    window.dispatchEvent(new CustomEvent('uwallet_agents_updated', { detail: agents }));
  } catch (e) {
    console.error('Error saving agents list:', e);
  }
}

/**
 * Update agent float balance (add or deduct), sync active agent session, and dispatch update events
 */
export function updateAgentFloat(
  agentIdOrPhone: string,
  amountDiff: number
): AgentProfile | null {
  const list = loadAgentsList();
  const cleanKey = agentIdOrPhone.trim();

  let targetIndex = list.findIndex(
    (a) => a.id === cleanKey || a.agentPhone === cleanKey || a.agentPhone.replace(/\D/g, '') === cleanKey.replace(/\D/g, '')
  );

  let updatedAgent: AgentProfile | null = null;

  if (targetIndex !== -1) {
    const prev = list[targetIndex];
    const newFloat = Math.max(0, prev.floatBalance + amountDiff);
    updatedAgent = {
      ...prev,
      floatBalance: newFloat,
    };
    list[targetIndex] = updatedAgent;
  } else {
    // If not found in default list, create/register as active agent
    const newId = `agt-${Date.now().toString().slice(-4)}`;
    updatedAgent = {
      id: newId,
      agentName: 'অনুমোদিত এজেন্ট',
      agentPhone: cleanKey,
      outletName: 'এজেন্ট আউটলেট',
      outletLocation: 'বাংলাদেশ',
      floatBalance: Math.max(0, amountDiff),
      securityDeposit: 5000,
      bonusBalance: 0,
      dailyLimit: 50000,
      usedLimitToday: 0,
      commissionEarnedToday: 0,
      totalCommissionBalance: 0,
      status: 'active',
      activatedAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(updatedAgent);
  }

  saveAgentsList(list);

  // Sync active agent session in localStorage if active agent matches
  try {
    const rawSession = localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession);
      const sessionPhone = parsedSession?.agent?.agentPhone;
      if (
        sessionPhone &&
        (sessionPhone === cleanKey || sessionPhone.replace(/\D/g, '') === cleanKey.replace(/\D/g, '') || parsedSession?.agent?.id === updatedAgent.id)
      ) {
        parsedSession.agent = {
          ...parsedSession.agent,
          floatBalance: updatedAgent.floatBalance,
        };
        localStorage.setItem(AGENT_SESSION_STORAGE_KEY, JSON.stringify(parsedSession));
      }
    }
  } catch (e) {
    console.error('Error syncing agent active session:', e);
  }

  // Notify listeners
  window.dispatchEvent(
    new CustomEvent('uwallet_agent_balance_updated', {
      detail: {
        agent: updatedAgent,
        amountDiff,
      },
    })
  );

  return updatedAgent;
}

/**
 * Update Agent Bonus Balance (Admin bonus credit)
 */
export function updateAgentBonus(
  agentIdOrPhone: string,
  bonusAmount: number
): AgentProfile | null {
  const list = loadAgentsList();
  const cleanKey = agentIdOrPhone.trim();

  const targetIndex = list.findIndex(
    (a) => a.id === cleanKey || a.agentPhone === cleanKey || a.agentPhone.replace(/\D/g, '') === cleanKey.replace(/\D/g, '')
  );

  if (targetIndex === -1) return null;

  const prev = list[targetIndex];
  const newBonus = Math.max(0, (prev.bonusBalance || 0) + bonusAmount);
  const updatedAgent = {
    ...prev,
    bonusBalance: newBonus,
    totalCommissionBalance: prev.totalCommissionBalance + bonusAmount,
  };
  list[targetIndex] = updatedAgent;
  saveAgentsList(list);

  // Sync session
  try {
    const rawSession = localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession);
      if (parsedSession?.agent?.id === updatedAgent.id || parsedSession?.agent?.agentPhone === updatedAgent.agentPhone) {
        parsedSession.agent = updatedAgent;
        localStorage.setItem(AGENT_SESSION_STORAGE_KEY, JSON.stringify(parsedSession));
      }
    }
  } catch (e) {
    console.error(e);
  }

  window.dispatchEvent(new CustomEvent('uwallet_agent_balance_updated', { detail: { agent: updatedAgent } }));
  return updatedAgent;
}

/**
 * Set or update Daily Transaction Permission Limit (দৈনিক লেনদেন পারমিশন লিমিট, e.g. 50,000 BDT)
 */
export function updateAgentDailyLimit(
  agentIdOrPhone: string,
  newDailyLimit: number
): AgentProfile | null {
  const list = loadAgentsList();
  const cleanKey = agentIdOrPhone.trim();

  const targetIndex = list.findIndex(
    (a) => a.id === cleanKey || a.agentPhone === cleanKey || a.agentPhone.replace(/\D/g, '') === cleanKey.replace(/\D/g, '')
  );

  if (targetIndex === -1) return null;

  const prev = list[targetIndex];
  const updatedAgent = {
    ...prev,
    dailyLimit: Math.max(1000, newDailyLimit),
  };
  list[targetIndex] = updatedAgent;
  saveAgentsList(list);

  try {
    const rawSession = localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession);
      if (parsedSession?.agent?.id === updatedAgent.id || parsedSession?.agent?.agentPhone === updatedAgent.agentPhone) {
        parsedSession.agent = updatedAgent;
        localStorage.setItem(AGENT_SESSION_STORAGE_KEY, JSON.stringify(parsedSession));
      }
    }
  } catch (e) {
    console.error(e);
  }

  window.dispatchEvent(new CustomEvent('uwallet_agent_balance_updated', { detail: { agent: updatedAgent } }));
  return updatedAgent;
}

/**
 * Approve pending agent with initial balance, bonus, and daily limit
 */
export function approvePendingAgent(
  agentIdOrPhone: string,
  initialFloat: number = 0,
  initialBonus: number = 0,
  dailyLimit: number = 50000
): AgentProfile | null {
  const list = loadAgentsList();
  const cleanKey = agentIdOrPhone.trim();

  const targetIndex = list.findIndex(
    (a) => a.id === cleanKey || a.agentPhone === cleanKey || a.agentPhone.replace(/\D/g, '') === cleanKey.replace(/\D/g, '')
  );

  if (targetIndex === -1) return null;

  const prev = list[targetIndex];
  const updatedAgent: AgentProfile = {
    ...prev,
    status: 'active',
    floatBalance: Math.max(0, initialFloat),
    bonusBalance: Math.max(0, initialBonus),
    dailyLimit: Math.max(5000, dailyLimit),
    securityDeposit: prev.depositAmount || prev.securityDeposit || 5000,
    activatedAt: new Date().toISOString().split('T')[0],
  };

  list[targetIndex] = updatedAgent;
  saveAgentsList(list);

  window.dispatchEvent(new CustomEvent('uwallet_agent_balance_updated', { detail: { agent: updatedAgent } }));
  return updatedAgent;
}

export function registerOrUpdateAgent(profile: AgentProfile): void {
  const list = loadAgentsList();
  const cleanPhone = profile.agentPhone.replace(/\D/g, '');
  const index = list.findIndex(
    (a) => a.id === profile.id || a.agentPhone.replace(/\D/g, '') === cleanPhone
  );

  if (index !== -1) {
    list[index] = { ...list[index], ...profile };
  } else {
    list.unshift(profile);
  }
  saveAgentsList(list);
}
