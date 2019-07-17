const $ = require('jquery');

async function init_app() {
    await init_ethereum();
    // e.g. http://192.168.1.2:8123/web/index.html?pot=0x405BC10E04e3f487E9925ad5815E4406D78B769e&amount=2
    let params = new URLSearchParams(document.location.search);
    window.potAddress = params.get("pot");
    // Not strictly necessary but for consistency
    if (!window.potAddress.toLowerCase().startsWith("0x")) {
        window.potAddress = "0x"+window.potAddress;
    }
    if (!isAddress(potAddress)) {
        console.log("Pot address is invalid");
        $('#pot-error').removeClass('hidden');
    }
    $('#pot').val(potAddress);
    window.amount = params.get("amount");
    if (amount <= 0 || amount > 10) {
        console.log("Fund amount is invalid");
        $('#amount-error').removeClass('hidden');
    }
    $('#amount').val(amount);

    await showBalance();

}
window.init_app = init_app;

async function showBalance() {
    // Show the wallet balances
    let account = await getAccount();
    console.log("Funding from account: ", account.address);
    console.log("Balance: ", account.ethBalance);
    $('#from-account').val(account.address);
    $('#eth-balance').val(account.ethBalance);
    if (account.ethBalance <= 0) {
        $('#eth-balance-error').removeClass('hidden');
    }
    $('#oxt-balance').val(account.oxtBalance);
    if (account.oxtBalance <= 0) {
        $('#oxt-balance-error').removeClass('hidden');
    }
    // Show the pot balance
    let potBalance = await getPotBalance(window.potAddress);
    $('#pot-balance').val(potBalance);
}
window.showBalance = showBalance;

async function submitTx() {
    console.log("Submit...");
    let fundButton = $("#fund-button");
    fundButton.attr("disabled", true).css('opacity', '0.3');
    let spinner = $('#spinner');
    fundButton.toggle();
    spinner.slideDown();
    try {
        let tx = await fundPot(potAddress, amount);
        window.tx=tx; // debug
        console.log("Funded.");
        $("#result-text").text("Successful Transaction");
        try {
            $("#tx-id").text(JSON.parse(tx)['transactionHash']);
        } catch (err) { }
        await showBalance();
    } catch (err) {
        console.log("Fund pot error: ", JSON.stringify(err));
        $("#result-text").text("Transaction Failed");
    }
    spinner.slideUp();
    $("#results").slideDown();
}
window.submitTx = submitTx;

