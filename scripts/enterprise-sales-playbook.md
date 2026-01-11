# MNNR Enterprise Sales Playbook

## Target Enterprise Profile

### Ideal Customer Profile (ICP)
- **Company Size**: 100-10,000 employees
- **Industry**: Technology, Finance, Healthcare, E-commerce
- **AI Usage**: Building AI-powered products or services
- **Monthly API Calls**: 10M+ potential
- **Budget**: $1,000+/month for billing infrastructure
- **Decision Makers**: VP Engineering, CTO, Head of AI/ML

### Disqualifiers
- No AI/ML initiatives
- Less than 100K monthly API calls potential
- No budget for infrastructure
- Long procurement cycles (>6 months)

## Sales Process

### Stage 1: Discovery (Week 1)
**Goal**: Qualify opportunity and understand needs

**Discovery Questions**:
1. "What AI models are you using today?" (GPT-4, Claude, etc.)
2. "How are you currently tracking AI API usage?"
3. "How do you bill customers for AI features?"
4. "What's your monthly API call volume?"
5. "What billing challenges are you facing?"
6. "Who else is involved in this decision?"

**Qualification Criteria** (BANT):
- Budget: Can they afford $1K+/month?
- Authority: Are we talking to decision maker?
- Need: Do they have billing pain points?
- Timeline: Are they ready to implement?

### Stage 2: Demo (Week 2)
**Goal**: Show value and technical fit

**Demo Flow** (30 minutes):
1. **Problem recap** (5 min)
   - Confirm their billing challenges
   - Align on desired outcomes

2. **Product overview** (10 min)
   - Dashboard walkthrough
   - API key management
   - Usage analytics
   - Billing integration

3. **Technical deep-dive** (10 min)
   - SDK integration (5 min to implement)
   - Webhook architecture
   - Security features
   - Enterprise capabilities

4. **Q&A and next steps** (5 min)

**Demo Environment**:
- Use staging with realistic data
- Pre-configure their AI models
- Show relevant use cases

### Stage 3: Technical Evaluation (Week 3-4)
**Goal**: Prove technical fit with POC

**POC Scope**:
- 2-week trial
- Free enterprise tier access
- Dedicated support channel
- Weekly check-in calls

**Success Criteria**:
- SDK integrated successfully
- Usage tracking working
- Dashboard adopted by team
- No blocking issues

### Stage 4: Commercial Negotiation (Week 5)
**Goal**: Close the deal

**Enterprise Pricing**:
```
Base: $1,000/month
Includes:
- 10M API calls
- Unlimited API keys
- Team management
- Priority support
- Custom SLA (99.9%)

Additional:
- $0.00005 per API call over 10M
- Premium support: +$500/month
- Dedicated infrastructure: +$2,000/month
- SAML SSO: Included
- Custom contract: Included
```

**Negotiation Tactics**:
- Annual prepay: 20% discount
- Multi-year: 30% discount
- Reference customer: 10% discount
- Case study participation: 10% discount

### Stage 5: Implementation (Week 6-8)
**Goal**: Successful onboarding

**Implementation Plan**:
1. Kickoff call with customer success
2. Technical integration support
3. Training sessions for team
4. Go-live monitoring
5. 30-day check-in

## Objection Handling

### "We built our own billing system"
**Response**: "That's impressive! Many of our customers started that way. The challenge is maintenance and scaling. Our customers find that MNNR handles the complexity so their engineers can focus on building AI features. Can I ask how much engineering time you spend on billing today?"

### "Stripe handles our billing"
**Response**: "Stripe is great for traditional billing. But for AI specifically, you need per-token metering, rate limiting, and agent-level controls that Stripe doesn't provide. MNNR actually uses Stripe under the hood, so you get Stripe's reliability plus AI-native features."

### "It's too expensive"
**Response**: "I understand budget is important. Let me ask - how much engineering time do you spend on billing today? At $150K+ for an engineer, even saving 10 hours a month makes MNNR pay for itself. Plus, better billing often increases revenue by 10-20% through accurate metering."

### "We're not ready yet"
**Response**: "That makes sense. Many of our customers started on the free tier while building. When do you expect to launch your AI features? I'd love to check back then. In the meantime, I'll send some resources that might be helpful."

### "We need to see a longer track record"
**Response**: "I appreciate that concern. While we're a new company, our team has deep experience from [background]. We're SOC 2 compliant and already serving [X] customers processing [Y] API calls. Would it help to speak with one of our reference customers?"

## Sales Tools

### Email Templates

**Cold Outreach**:
```
Subject: AI billing at [Company]

Hi [Name],

I noticed [Company] is building AI-powered [product/features]. Impressive work.

Quick question: how are you handling billing for AI API usage today?

We built MNNR specifically for AI billing - per-token pricing, usage metering, agent rate limits. Customers like [reference] are using it to monetize their AI features.

Worth a 15-minute call to see if there's a fit?

Best,
[Your name]
```

**Follow-up after Demo**:
```
Subject: MNNR next steps

Hi [Name],

Great meeting you today. As discussed:

✅ MNNR supports [their AI models]
✅ 5-minute integration with [their stack]
✅ Pricing: [custom quote]

Next steps:
1. I'll send the POC setup guide
2. Schedule kickoff call for [date]
3. You'll have 2 weeks to evaluate

Any questions before we proceed?

Best,
[Your name]
```

### Battle Cards

**vs. Custom Build**:
| Factor | Custom | MNNR |
|--------|--------|------|
| Time to implement | 3-6 months | 5 minutes |
| Engineering cost | $50K-200K | $0 |
| Maintenance | Ongoing | None |
| Per-token billing | Custom build | Built-in |
| Rate limiting | Custom build | Built-in |

**vs. Stripe Only**:
| Factor | Stripe | MNNR + Stripe |
|--------|--------|---------------|
| Per-token billing | No | Yes |
| Usage metering | Limited | Full |
| AI agent keys | No | Yes |
| Spending limits | No | Yes |
| Rate limiting | No | Yes |

## Metrics & Targets

### Sales Targets (Quarterly)
- Pipeline: $500K
- Closed Won: $150K ARR
- Enterprise Deals: 5
- Average Deal Size: $30K ARR

### Activity Metrics (Weekly)
- Outreach: 50 contacts
- Discovery calls: 10
- Demos: 5
- Proposals: 2

### Win Rates
- Discovery → Demo: 50%
- Demo → POC: 60%
- POC → Closed Won: 70%
- Overall: 21%

## Commission Structure

- Base: $80K
- OTE: $160K
- Commission: 10% of first-year ACV
- Accelerators: 15% above quota
- Spiffs: $500 per enterprise logo

## Resources

### Internal
- Slack: #sales
- CRM: [Link]
- Demo environment: [Link]
- Pricing calculator: [Link]

### Customer-Facing
- Documentation: https://mnnr.app/docs
- Case studies: [Link]
- Security whitepaper: [Link]
- SOC 2 report: Available on request

### Competitive
- Battle cards: [Link]
- Win/loss analysis: [Link]
- Competitor pricing: [Link]
