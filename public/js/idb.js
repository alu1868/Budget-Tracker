let db;

const request = indexDB.open('Budget-Tracker', 1);

request.onupgraqdeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("New-Transaction", { autoIncrement: true})
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadingTransaction();
    }
}

request.onerror = function (event) {
    console.log(event.target.errorCode)
}

function savingTransaction (record) {
    const transaction = db.transaction(["New-Transaction"], "readwrite");
    const store = transaction.objectStore("New-Transaction");

    store.add(record)
}


function uploadingTransaction() {
    const transaction = db.transaction(["New-Transaction"], "readwrite");
    const store = transaction.objectStore("New-Transaction");

    const getAll = store.getAll()

    getAll.onsuccess = function () {
        if (getAll.results.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                header: {
                    Accept: "application/json, test/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse)
                    }

                    const transaction = db.transaction(["New-Transaction"], "readwrite");
                    const budgetObjectStore = transaction.objectStore("New-Transaction");
                    budgetObjectStore.clear();

                    alert("All saved transactions have been submitted!")
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}


window.addEventListener("online", uploadingTransaction)