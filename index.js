import {movieObjs} from "./content.js"
/**
 *                  ============
 *                  Prerequisite
 *                  ============
 * 1- fetching the openai, supabase and LangChain api 
 * 2- Convert content.js to embedding vectors 
 *                  =============
 *                  Functionality
*                   =============   
 * 1- pressing "Let's Go" button to start the program
 * 2- checking the value of each textarea with querySelecroAll() 
 *  2.1- show an error if one of the fields is empty
 *  2.2- proceed to 3 
 * 3- compine the answers into one answer then find it's embedding vector
 * 4- use the value for similarity check 
 * 5- take the top 1 number of answers and give them with the user answers to a chatCompletion endpoint
 *      for generative output 
 * 6- with dom manipulation show the answer with the reasone of prefered 
 * 7- upon pressing "Go Again" button the application will startover
 */

// title, content, embedding, id
function getMovieAsStringList(){
    const movieList = movieObjs.map(movie =>{
        return movie.title + "\n" + movie.releaseYear + "\n" + movie.content + "\n"
    })
    return movieList
}


async function createEmbeddings() {
    const movieData = getMovieAsStringList()
    // fetch post request 
    const res = await fetch('https://movie-openai-api.osamaforedu.workers.dev/api/batch-embed',{
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify(movieData)
    })
    const data = await res.json()

    await fetch('https://movie-openai-api.osamaforedu.workers.dev/api/insertSupa', {
        method: "POST", 
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify(data)
    })

}


document.getElementById("go-btn").addEventListener('click', function(){
    let userAnswers = []
    document.querySelectorAll("textarea").forEach(textarea => {
        if(!textarea.value){
            const warning = document.createElement('h3')
            warning.classList.add("warning")
            warning.id = "warning"
            warning.innerHTML =`Something went wrong<br/>make sure you answered all the question` 
            document.querySelector("main").appendChild(warning)
            setTimeout( function(){
                document.getElementById("warning").remove()
            },2500)
        } else{
                // Take the values embed them then use similarity check and get the 1st mathcing result 
                userAnswers.push(textarea.value)                 
        } 
        })
        
        if(userAnswers.length){
            giveTheResult(userAnswers)
        }
})

// const user = [
//     `The Shawshank Redemption Because it taught me to never give up hope no matter how hard life gets`
    
//     , `I want to watch movies that were released after 1990`
//     , `I want to watch something stupid and fun`]
// getMathcingVector(user)

async function giveTheResult(userAnswers){
    let matchingResult = await getMathcingVector(userAnswers) 
    console.log(matchingResult)
    const messages = [
        {
            role: "system", 
            content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`
        }, 
        {
            role: "user", 
            content: `user answers: ${userAnswers} movie recommanded to user: ${matchingResult.output}`
        }
    ]
    // const res = await openai.chat.completions.create({
    //     model: "gpt-3.5-turbo",
    //     messages
    // })
    
    
    const res = await fetch('https://movie-openai-api.osamaforedu.workers.dev/api/chatCompletion' ,{
        method: "POST", 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(messages)
    })
    const data = await res.json()
    
     renderHtml(data.choices[0].message.content, movieObjs[matchingResult.id].title)
}


async function getMathcingVector(userAnswers){
    userAnswers = userAnswers.join('\n')

    // fetch request with post method 
    // const {data} = await openai.embeddings.create({
    //     model: 'text-embedding-ada-002',
    //     input: userAnswers 
    // })

    const res = await fetch('https://movie-openai-api.osamaforedu.workers.dev/api/embedd',
        {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify(userAnswers)

        }
    )
    const data = await res.json()

    
    // fetch request with POST method
    // const output = await supabase.rpc('match_documents', {
    //     query_embedding: data[0].embedding,
    //     match_threshold: 0.7,
    //     match_count: 1
    // })

    const outputRes = await fetch('https://movie-openai-api.osamaforedu.workers.dev/api/similarity', 
        {
            method: "POST", 
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify(data)

        }
    )

    const output = await outputRes.json()
    
    console.log(output)
    if(!output.data.length)
        return {output: 'No mathcing results', id:''}
           
    return {output: output.data[0].content, id: (output.data[0].id - 1)}
}


function renderHtml(movieDesc, movieTitle){
    console.log(movieTitle)
    
    document.querySelector('main').innerHTML = `
        
        <div>
            <h1 class="result-title">${movieTitle}</h1>
            <p class="result-reasone">${movieDesc}<p>
            <button id="go-btn">Go Again</button>
        </div>
    `
}


async function getMovieTitles(){
    //Getting the document
    const res = await fetch('movies.txt')
    let text = await res.text()
    //spliting it's to lines and dealing with it as an array
    text = text.split('\n')
    // specify the pattern to extract from the doc
    const regixPattern = /^(.+?):\s+\d{4}/
    
    //Getting the matching patteren of movieTitle: Year of 4 digit
    //then Getting red of the null value resulted from privouise step
    //the return will be ["movieTitle: Year", "MovieTitle"]
    // so we choose the column of index 1 for each row  
    return text.map(line=>line.match(regixPattern)).filter(val => val).map(row => row[1])
}



