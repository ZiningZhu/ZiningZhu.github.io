$(document).ready(function() {
    console.log("render_team.js");

    async function fetchTeamData() {
        const response = await fetch('data.json');
        const data = await response.json();
        return data;
    }

    function createCard(member) {
        return `
            <div class="col">
                <div class="card h-100">
                    <img src="img/${member.Picture}" class="card-img-top" alt="picture of ${member.Name}">
                    <div class="card-body">
                        <div><a href="${member.Homepage}"><h5 class="card-title">${member.Name}</h5></a></div>
                        <p class="card-text">
                            ${member.Title ? `${member.Title}, ` : ''}${member.Program}<br>
                            ${member.Coadvise ? `${member.Coadvise}<br>` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTeam(data) {
        const statusOrder = ['current', 'alumni'];
        
        statusOrder.forEach(status => {
            const container = document.getElementById('team-container-' + status);
            const membersWithStatus = data.filter(member => member.Status === status);
            
            if (membersWithStatus.length > 0) {
                membersWithStatus.forEach(member => {
                    container.innerHTML += createCard(member);
                });
            }
        });
    }

    fetchTeamData().then(renderTeam);
});