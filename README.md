# 🏃‍♂️ Easy Leads – Smart Conversations for Lead Conversions

**Easy Leads** that reaches out and engages with leads at scale. It drives smart conversations and maintains the lead score through the conversation. It handsover a converted lead to the sales tema / onboarding team with an entire client profile. It completely automates and improves the lead conversion process. Technically, it is a backend service which uses WhatsApp using **Botpress + OpenAI + WhatsApp Business API**. Designed for high-conversion businesses, it dynamically qualifies leads, adapts to their behavior, and routes them to a sales agent when ready—all while generating a ready-to-use **sales script** for the team.  


![WhatsApp Image 2025-03-05 at 3 59 33 PM](https://github.com/user-attachments/assets/7f8b9e6f-828c-4fe4-91ce-8576a2683e22)

---



## 🚀 Key Features  

- **🔗 Instant Lead Triggers**: Connects with Meta Instant Forms, Typeform, or other lead sources via webhooks.  
- **💬 Smart WhatsApp Conversations**: Uses ChatGPT through Botpress to initiate and carry personalized, dynamic conversations.  
- **🧠 Real-Time Qualification**: Scores leads using both **explicit (e.g. budget, role)** and **implicit (e.g. response time, engagement)** factors.  
- **🧾 Sales Script Generator**: Generates a structured summary of the chat to assist sales agents in follow-ups.  
- **📤 CRM & API Integrations**: Integrates with tools like HubSpot, Salesforce, or custom CRMs for seamless handoff and tracking.  
- **🧩 Brand & Chat Personalization**: Supports fully configurable brand tone, chatbot personality, and lead engagement strategies (direct sales vs. nurturing).  

---

## 🧠 How It Works  

### 1. **Lead Capture & Trigger**
- Captures incoming lead data via webhook (Meta / Typeform).
- Starts chat flow with Botpress using Botpress API.

### 2. **Chat Initiation Workflow**
- Pulls company-specific ICP & chatbot personality.
- Kicks off WhatsApp conversation with lead via Botpress.
- Uses dynamic prompts (via OpenAI) tailored to company’s tone and objectives.

### 3. **Chat Reply Workflow**
- Every response is analyzed in real-time.
- Updates lead score using:
  - **Explicit data** (job title, budget, timeline)
  - **Implicit data** (engagement, speed, depth)
- Follows one of two paths:
  - 🔹 **Direct Sales** → Pushes for a call/demo.
  - 🔹 **Long-Term Nurturing** → Adds value over time.

### 4. **Handoff & Script Generation**
- If lead is qualified (score threshold met), triggers a webhook to notify the sales team.
- Automatically generates a **sales call script** using key insights from the chat.

---

## 🧱 Tech Stack

| Layer              | Tech                        |
|--------------------|-----------------------------|
| Backend Framework  | Node.js (NestJS)            |
| Bot Platform       | Botpress (Chat + API)       |
| AI Integration     | OpenAI API (GPT-4)          |
| Messaging Layer    | WhatsApp Cloud API / Twilio |
| Database           | PostgreSQL / MongoDB        |
| CRM Integration    | Custom or Zapier-based      |

---

## ⚙️ Setup & Deployment (Coming Soon)

> Full documentation on environment variables, Botpress setup, OpenAI key usage, and WhatsApp integration coming soon.

---

## 📌 Ideal Use Cases

- Fitness & Coaching Businesses  
- Service-Based Startups  
- High-Ticket Sales Teams  
- B2B SaaS Qualifiers  
- Agencies managing multiple brands  

---

## 👥 Contributors  

- Built by [Pranav Yadav](https://github.com/pranav-9) and team  
- Based on real-world qualification flows tested in the **fitness coaching** domain  

---

## 📞 Want to Use This for Your Business?

Contact us at **team@onthemove.fit** or visit [onthemove.fit](https://onthemove.fit) to explore a demo.

---

## 🧪 Roadmap

- [ ] Admin Dashboard for ICP & Chat Strategy Config  
- [ ] Airtable CRM Plugin  
- [ ] Analytics Dashboard (Conversion, Drop-off, Score Tracking)  
- [ ] Custom GPT persona loader via brandbook parsing  

---

## License

MIT License. Use freely, contribute wisely.


<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
