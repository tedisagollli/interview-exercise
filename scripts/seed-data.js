export const partners = [
  { id: 'msp-demo', name: 'Demo IT Services' },
]

export const reportedEmails = [
  {
    id: 'email-invoice-demo',
    mspId: 'msp-demo',
    headers: [
      { name: 'From', value: 'billing@vendor-payments.example' },
      { name: 'To', value: 'alex@acme.example' },
      { name: 'Subject', value: 'Action required: overdue invoice' },
      { name: 'Message-ID', value: '<invoice-demo@vendor-payments.example>' },
      { name: 'Authentication-Results', value: 'spf=fail; dkim=fail; dmarc=fail' },
    ],
    body: 'Hello Alex,\n\nYour invoice is overdue. Please review the payment request at https://vendor-payments.example/invoice/123 today to avoid an interruption in service.\n\nBilling team',
    subject: 'Action required: overdue invoice',
    from: 'billing@vendor-payments.example',
    to: ['alex@acme.example'],
    severity: 'high',
    companyId: 'company-acme',
    reporterId: 'reporter-alex',
  },
  {
    id: 'email-newsletter-demo',
    mspId: 'msp-demo',
    headers: [
      { name: 'From', value: 'news@community.example' },
      { name: 'To', value: 'sam@acme.example' },
      { name: 'Subject', value: 'Your weekly community update' },
      { name: 'Message-ID', value: '<newsletter-demo@community.example>' },
      { name: 'Authentication-Results', value: 'spf=pass; dkim=pass; dmarc=pass' },
    ],
    body: 'Hi Sam,\n\nHere is this week’s community update. Our next meetup is on Friday. Visit https://community.example/events for details.\n\nYou received this email because you subscribed to community updates.',
    subject: 'Your weekly community update',
    from: 'news@community.example',
    to: ['sam@acme.example'],
    severity: 'low',
    companyId: 'company-acme',
    reporterId: 'reporter-sam',
  },
]
