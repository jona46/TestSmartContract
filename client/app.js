App = {
    contracts: {},

    init: async () => {
        console.log('Cargado')
        await App.loadEthereum()
        await App.loadAccount()
        await App.loadContracts()
        App.render()
        await App.renderTask()
        
    },

    loadEthereum: async () => {
        if(window.ethereum){
            App.web3Provider = window.ethereum
            //console.log('Ethereum existe')
            await window.ethereum.request({method: 'eth_requestAccounts'})
        } else{
            console.log('No esta instalado Ethereum. ')
        }
    },

    loadAccount: async () =>{
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        //console.log(accounts)
        App.account = accounts[0]
    },

    loadContracts: async () => {
        const res = await fetch("TasksContract.json")
        const tasksContractJSON = await res.json()
        console.log(tasksContractJSON)

        App.contracts.tasksContract = TruffleContract(tasksContractJSON)
        App.contracts.tasksContract.setProvider(App.web3Provider)
        App.tasksContract = await App.contracts.tasksContract.deployed()

    },

    render: async () => {
        document.getElementById('account').innerText = App.account

    },

    renderTask: async () => {
        const taskCounter = await App.tasksContract.taskCounter()
        const taskCounterNumber = taskCounter.toNumber()
        console.log(taskCounterNumber)

        let html=''

        for(let i=1; i<=taskCounter; i++){
            const task = await App.tasksContract.tasks(i)
            const taskId = task[0]
            const taskTitle = task[1]
            const taskDescription = task[2]
            const taskDone = task[3]
            const taskCreated = task[4]

            let taskElement = `
            <div class="card bg-dark rouded-0 mb-2">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${taskTitle}</span>
                    <div class="form-check form-switch">
                        <input class="form-check-input" data-id="${taskId}" type="checkbox" ${taskDone && "checked"} onchange="App.toggleDone(this)"/>
                    </div>
                    
                </div>
                <div class="card-body">
                    <span>${taskDescription}</span>
                    <p class="text-muted">Esta tarea fue creada ${new Date(taskCreated * 1000).toLocaleString()}</p>
                </div>
                
            </div>`

            html+= taskElement;
        }
        document.querySelector('#tasksList').innerHTML = html;
    },

    createTask: async (title, description) => {
        const result = await App.tasksContract.createTask(title, description, {from: App.account})
        console.log(result.logs[0].args)
    },

    toggleDone: async (elemento) =>{
        const taskId = elemento.dataset.id

        await App.tasksContract.toggleDone(taskId, {from: App.account})
        window.location.reload()


        console.log(elemento.dataset.id)
    }

}

App.init()