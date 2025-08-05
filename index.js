import {movieObjs} from "./content.js"


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

async function giveTheResult(userAnswers){
    let matchingResult = await getMathcingVector(userAnswers) 
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
    
    const res = await fetch('https://movie-openai-api.osamaforedu.workers.dev/api/chatCompletion' ,{
        method: "POST", 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(messages)
    })
    const data = await res.json()
    
    const movieTitle = matchingResult.id ? movieObjs[matchingResult.id].title : "No Matching Result"
    
    renderHtml(data.choices[0].message.content, movieObjs[matchingResult.id].title)
}


async function getMathcingVector(userAnswers){
    userAnswers = userAnswers.join('\n')

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
    
    document.querySelector('main').innerHTML = `
        
        <div>
            <h1 class="result-title">${movieTitle}</h1>
            <p class="result-reasone">${movieDesc}<p>
            <button id="go-btn">Go Again</button>
        </div>
    `
}


