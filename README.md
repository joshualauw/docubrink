# 📘 Docubrink

**Docubrink** is a document-based **Retrieval-Augmented Generation (RAG)** web service built for learning and experimentation.  
It leverages **NestJS**, **LangChain**, and **OpenAI** to process, embed, and query documents intelligently — providing a foundation for knowledge retrieval and AI-assisted Q&A systems.

## 🚀 Features

- 🧠 **RAG Pipeline** — Document chunking, embedding, and retrieval using `pgvector`, `LangChain`, and `OpenAI`.
- ⚙️ **RESTful API** — Built with **NestJS** for scalability and modular architecture.
- 🔄 **Background Jobs** — Asynchronous processing powered by **BullMQ** and Redis.
- 🧩 **Multi-tenancy** — Data segregation and filtering for multi-organization use cases.
- 🔑 **API Key Management** — Fine-grained access control for client apps.
- 🧱 **Role-Based Access Control (RBAC)** — Secure and flexible permission system.
- ⚡ **Caching Layer** — Redis-based caching for improved response times.
- 🐳 **Dockerized Environment** — Ready for deployment on AWS and scalable infrastructures.
- 🧰 **ORM Integration** — Database management using **Prisma** and PostgreSQL with **pgvector** extension.
- 💳 **Subscription Management** — Integrated **Stripe Billing API** for subscription plans, payment intents, and webhooks.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | [NestJS](https://nestjs.com/) |
| AI / Embeddings | [LangChain](https://www.langchain.com/), [OpenAI API](https://openai.com/api) |
| Database | PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) |
| ORM | [Prisma](https://www.prisma.io/) |
| Caching | [Redis](https://redis.io/) |
| Payments | [Stripe API](https://stripe.com/docs/api) |
| Background Jobs | [BullMQ](https://docs.bullmq.io/) |
| Deployment | Docker, AWS (future CI/CD pipeline) |

🧩 To-Do

[V] API Key Management
[V] Organization User & Role Access
[V] Implement RAG Pipeline
[V] Manage Subscription, Billing, and Payments
[ ] Implement CI/CD pipeline (GitHub Actions → AWS)
[ ] Add API rate limiting and usage analytics
[ ] Create minimal web dashboard using NuxtJS
[ ] Add PDF / DOCX ingestion service
