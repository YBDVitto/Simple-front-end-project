// in nodejs() si usa require()
//in front-end javascript non si può usare require ma si usa import
import { ethers } from "./ethers.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
balanceButton.onclick = getBalance
connectButton.onclick = connect
fundButton.onclick = fund
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("connectButton").innerHTML = "Connesso!"
    } else {
        document.getElementById("connectButton").innerHTML =
            "Non connesso, devi installare metamask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)

    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet
        // contract that we are interacting with
        // ABI
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        // ritorna qualunque wallet è connesso al provider, ovvero metamask
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            console.log(transactionResponse)
            await Validate(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

function Validate(transactionResponse, provider) {
    console.log("Validating " + transactionResponse.hash + "...")
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                "Completed with " +
                    transactionReceipt.confirmations +
                    " confirmations",
            ) // se non di specifica il .wait(n), di default aspetta un blocco

            resolve()
        })
    })

    async function getBalance() {
        if (typeof window.ethereum !== "undefined") {
            const provider = ethers.providers.Web3Provider(window.ethereum)
            // è come dire: const provider = Metamsk
            const balance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.parseEther(balance))
        }
    }
}

async function withdraw() {
    const ethAmountWithdraw = document.getElementById("ethAmountWithdraw").value
    if (typeof window.ethereum !== "undefined") {
        console.log("Prelevando...")
        const provider = ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw({
                value: ethers.utils.parseEther(ethAmountWithdraw),
            })
            await Validate(transactionResponse, provider)
            // const transactionReceipt = transactionResponse.wait(1)
        } catch (error) {
            console.log(error)
        }
    }
}
