import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";




async function handleEmbeddings(openai, userAnswer){
	const {data} = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: userAnswer 
    })

	return data
}

async function handleInsertion(supabase, data){
	
	await supabase.from('posts').insert(data)
}

async function handleSimilarity(supabase, data){
	const output = await supabase.rpc('match_documents', {
        query_embedding: data[0].embedding,
        match_threshold: 0.7,
        match_count: 1
    })
	return output
}
	
async function  handleBatchEmbedding(openai, movieData) {
	const data = await Promise.all( movieData.map(async content => 
        {
                const embedding = await openai.embeddings.create({
                model: "text-embedding-ada-002", 
                input: content
            })
        
            return {content: content, embedding: embedding.data[0].embedding}
        })
    )
	return data
}


export default {
	
	async fetch(request, env, ctx) {
		const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type'
		};

		
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}


		const { pathname } = new URL(request.url)


		if (!env.OPENAI_API_KEY) throw new Error("OpenAI API key is missing or invalid.");

		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
		});

		const privateKey = env.SUPABASE_API_KEY
		if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`)
		const url = env.SUPABASE_URL
		if (!url) throw new Error(`Expected env var SUPABASE_URL`)
		const supabase = createClient(url, privateKey)

		try{
			
			
			if(pathname === '/api/embedd' && request.method === 'POST'){

					const res = await request.json()
					const data = await handleEmbeddings(openai, res)
					return new Response(JSON.stringify(data), {headers: corsHeaders})
				}

			else if(pathname === '/api/similarity' && request.method === 'POST')
			{
				const res = await request.json()
				const result = await handleSimilarity(supabase,res)
				return new Response(JSON.stringify(result), { headers: corsHeaders})
			}

			else if(pathname === '/api/insertSupa' && request.method === 'POST')
			{
				const res = await request.json()
				await handleInsertion(supabase, res)
				return new Response('Insertion was secsussful', { headers: corsHeaders})
			}
			else if(pathname === '/api/chatCompletion' && request.method === 'POST'){
				const messages = await request.json()
				
				const res = await openai.chat.completions.create({
						model: "gpt-3.5-turbo",
						messages
				})
				
				return new Response(JSON.stringify(res), { headers: corsHeaders})
			}

			else if(pathname === '/api/batch-embed' && request.method === "POST"){
				const res = await request.json()
				const data = await handleBatchEmbedding(openai, res)
				return new Response(JSON.stringify(data), { headers: corsHeaders})
			}
				
		} catch(e){
			return new Response(JSON.stringify({error: e.message}), {status: 500, headers:corsHeaders})
		}
	return new Response(JSON.stringify('Not found, What the hell '+ JSON.stringify(pathname)), {
      status: 404,
      headers: corsHeaders
    });
	},
};
