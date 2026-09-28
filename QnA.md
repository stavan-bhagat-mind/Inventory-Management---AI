# Project Q&A

**What was the most challenging part?**
Handling concurrent inventory reservations. When multiple users try to reserve the last available item at the exact same millisecond, race conditions can cause overselling and negative stock.

**What approach did you take?**
I enforced data integrity at the database level. I used PostgreSQL transactions with row-level pessimistic locking,This queues simultaneous requests. I also added database-level `CHECK` constraints to guarantee stock never drops below zero.

**Which AI prompts were most useful?**
The prompts that provided explicit, constrained business rules (e.g., "Users cannot release more inventory than reserved", "Stock modifications must create history records")

**What problems did AI-generated output have?**
The AI initially favored over-engineered object-oriented patterns and overdone some of the requirements eventhough its not strictly part of roadmap.

**How did you validate the AI output?**
I wrote an automated concurrency test (`tests/concurrency.test.js`). By firing 10 simultaneous API requests to reserve 5 available items, the test definitively proved the AI's locking logic worked (5 successes, 5 safe rejections) without manual UI clicking.

**What edge cases did you identify?**
- What happens if a reservation is never completed or cancelled (requires a timeout/cron job to auto-release).
- Preventing stock releases that exceed the currently reserved stock.

**What would you improve if you had more time?**
- Add a background worker (Cron) or delay queue (Redis/RabbitMQ) to automatically release reserved stock if a user abandons their checkout after 15 minutes.
- Implement Redis caching for the read-heavy `GET /api/inventory` endpoints.

**What did you learn from this task?**
How to correctly architect a React + Node.js monorepo, apply strict concurrency controls using SQL row-level locks, and lil about responsive frontend and its structure.