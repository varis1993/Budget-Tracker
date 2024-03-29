let db;
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function(event) {
  // save a reference to the database 
  const db = event.target.result;
  // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
  db.createObjectStore('new_budget', { autoIncrement: true });
};


request.onsuccess = function (event) {
  db = event.target.result;


  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function (event) {
  console.log("Error: " + event.target.errorCode);
};

// This function will be executed if we attempt to submit a new budget event and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permission
  const transaction = db.transaction(["new_budget"], "readwrite");

  // access the object store for "new_budget"
  const store = transaction.objectStore("new_budget");

  // add record to your store with add method
  store.add(record);
}

function uploadBudget() {
  // open a transaction on db
  const transaction = db.transaction(["new_budget"], "readwrite");

  // access object store
  const store = transaction.objectStore("new_budget");

  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          // delete records if successful
          const transaction = db.transaction(["new_budget"], "readwrite");
          const store = transaction.objectStore("new_budget");
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = db.transaction(["new_budget"], "readwrite");
  const store = transaction.objectStore("new_budget");
  store.clear();
}

// listen for app coming back online
window.addEventListener("online", uploadBudget);