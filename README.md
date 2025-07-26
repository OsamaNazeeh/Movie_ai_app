
# 🎬 AI-Powered Movie Recommendation App

  

This is a lightweight, serverless application that recommends movies based on your input using **OpenAI embeddings**, **Supabase vector search**, and **Cloudflare Workers**. The app captures natural-language answers from users and matches them with similar movies using semantic search.

  

---

## 🚀 Features

  

- ✨ Natural language understanding using `text-embedding-ada-002`

- ⚡ Fast, serverless backend with **Cloudflare Workers**

- 🧠 Semantic vector search powered by **Supabase PGVector**

- 📄 User inputs are embedded and stored for intelligent matching

- 🔍 Returns the most semantically relevant movie for a user's taste

  

---
## 🛠️ Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
|               |                                 |
| Frontend      | HTML / JavaScript (custom)      |
| Backend       | Cloudflare Workers              |
| AI Embeddings | OpenAI `text-embedding-ada-002` |
| Database      | Supabase + PGVector extension   |
| Storage       | Supabase `posts` table          |
  
---

## 🧩 How It Works

  

1. The user submits a movie preference or answer (e.g., “I want something adventurous with a sci-fi vibe”).

2. This input is sent to the Cloudflare Worker.

3. The input is embedded using OpenAI and stored in Supabase.

4. A semantic search (`match_documents`) retrieves the closest movie match from your database.

5. The result is returned and shown on the frontend.

  

---

  

## 📂 Folder Structure

```
project-root/

├── movie-openai-api/      # Cloudflare Worker (serverless backend)

│   └── index.js           # Embedding & Supabase logic

├── public/ or frontend/   # Frontend files (optional)

├── .gitignore

└── README.md

```

---
## 🧪 Environment Variables

Set these in your Cloudflare Worker (`wrangler.toml` or dashboard):

```
OPENAI_API_KEY=<your-openai-key>

SUPABASE_URL=<your-supabase-url>

SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

```

--- 

## ✅ Setup Instructions


1. **Install dependencies** (if using bundlers or tooling)

2. **Deploy Cloudflare Worker**:

   ```bash

   npx wrangler deploy

   ```

3. **Set up Supabase**:

   - Create a `posts` table with:

     - `content` column (text)

     - `embedding` column (`vector(1536)`)

   - Add a `match_documents` RPC for vector search (see the equation below)  

4. **Embed your movie dataset** using the batch embed function

5. **Connect the frontend** or test API manually
  
---
## 🧠 Example SQL: `match_documents` RPC

   Write This in as a query in Supabase 

```sql

create or replace function match_documents (

  query_embedding vector(1536),

  match_threshold float,

  match_count int

)

returns table (

  id uuid,

  content text,

  similarity float

)

language sql

as $$

  select id, content, 1 - (embedding <=> query_embedding) as similarity

  from posts

  where 1 - (embedding <=> query_embedding) > match_threshold

  order by similarity desc

  limit match_count;

$$;

```

---

## 📦 Deployment

1- Add the project to your github repo 
2- from cloudflare dashboard go: workers and pages => pages tab => clone repo 
3- then authorize cloudflare to your github and set the build tool and folder directory 

---
## 🔮 Future Enhancements

  

- 🧠 Personalized multi-movie recommendation

- 📊 Dynamic rating integration

- 💬 Chat interface with OpenAI GPT

- 🌐 Frontend for exploring recommendations visually

---
## 🙏 Credits

- [OpenAI](https://openai.com/)

- [Supabase](https://supabase.com/)

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

