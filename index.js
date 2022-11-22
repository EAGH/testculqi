import { MongoClient } from "mongodb";
const MONGODB_URI = "mongodb+srv://testculqi:testculqi@testculqi.ytvbzv3.mongodb.net/?retryWrites=true&w=majority";
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    // Connect to our MongoDB database hosted on MongoDB Atlas
    const client = await MongoClient.connect(MONGODB_URI);
    // Specify which database we want to use
    const db = await client.db("testculqidb");
    cachedDb = db;
    return db;
}
// Once we connect to the data
export const handler = async (event) => {
    // Get an instance of our database
    const db = await connectToDatabase();
    /* event.email
    event.card_number
    event.cvv
    event.expiration_year
    event.expiration_month */
    console.log("***********", event.headers["header1"]);
    console.log("+++++++++++", event);
    const method = event.requestContext.http.method;
    let response = {
        statusCode: 400,
        body: 'Error endpoint',
    };
    if (method === 'POST') {
        if (!valid_credit_card(event.card_number)) throw 'Error Card Number' // { statusCode: 400, body: 'Error Card Number'};
        if (!valid_length(event.card_number, 13) && !valid_length(event.card_number, 16)) throw 'Error length Card Number' // { statusCode: 400, body: 'Error length Card Number'};
        if (!valid_length(event.cvv.length, 3) || !valid_length(event.cvv.length, 4)) throw 'Error length Code CVV' // { statusCode: 400, body: 'Error length Code CVV'};
        if ((!valid_length(value.length, 1) && !valid_length(value.length, 2)) || !valid_month(event.expiration_month)) throw 'Error Month' // { statusCode: 400, body: 'Error length Code CVV'};
        if (!valid_year(event.expiration_year) || !valid_date(event.expiration_year.length, 4)) throw 'Error Year' // { statusCode: 400, body: 'Error month'};
        if (!valid_email(event.email) || event.email.length < 5 || event.email.length > 100) throw 'Error Year' // { statusCode: 400, body: 'Error year'};
        const cards = await db.collection("cards").createIndex(event);
        response = {
            statusCode: 200,
            body: JSON.stringify(cards),
        };
    }
    return response;
};

function valid_credit_card(value) {
    if (/[^0-9-\s]+/.test(value)) return false;
    var nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, "");
    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
            nDigit = parseInt(cDigit, 10);
        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }
        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) == 0;
}
function valid_length(value, length) {
    if (value != length) return false;
    return true;
}
function valid_month(value) {
    value = parseInt(value, 10);
    if (value < 1 || value > 12) return false;
    return true;
}
function valid_year(value) {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    if ((parseInt(value, 10) - currentYear) > 5) return false;
    return true;
}
function valid_email(value) {
    const prov = value.split("@");
    if (prov[1] === 'gmail.com' || prov[1] === 'hotmail.com' || prov[1] === 'yahoo.es') return true;
    return false;
}
function valid_token(value) {
    const prov = value.split("@");
    if (prov[1] === 'gmail.com' || prov[1] === 'hotmail.com' || prov[1] === 'yahoo.es') return true;
    return false;
}