import { init, vote, getResults } from './app.js';

window.onload = async () => {
    await init();
    document.getElementById("voteButton").onclick = async () => {
        const candidateIndex = document.getElementById("candidateSelect").value;
        await vote(candidateIndex);
        alert("Vote submitted!");
    };

    document.getElementById("showResults").onclick = async () => {
        const results = await getResults();
        console.log(results);
    };
};
