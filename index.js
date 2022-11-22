import { MongoClient } from "mongodb";
const MONGODB_URI = "mongodb+srv://testculqi:testculqi@testculqi.ytvbzv3.mongodb.net/?retryWrites=true&w=majority";
let cachedDb = null;
// funcion para conectar a la DB
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    const client = await MongoClient.connect(MONGODB_URI);
    const db = await client.db("testculqidb");
    cachedDb = db;
    return db;
}
// funcion principal de lambda
export const handler = async (event) => {
    let response = {
        statusCode: 400,
        body: 'Error endpoint',
    };
    // verificacion del token primeramente
    if (!tokenMiddleware(event.headers.authorization)) return response;
    // si el token esta bien podria continuar con ejecutar la coneccion de la bd
    const db = await connectToDatabase();
    //se obtiene el metodo http para verificar que sea post
    const method = event.requestContext.http.method;
    if (method === 'POST') {
        try {
            let body = JSON.parse(event.body)
            if (!valid_credit_card(body.card_number)) throw 'Error Card Number' // validate LUHN
            if (!valid_length(body.card_number, 13) && !valid_length(body.card_number, 16)) throw 'Error length Card Number' // validate cards
            if (!valid_length(body.cvv, 3) && !valid_length(body.cvv, 4)) throw 'Error length Code CVV' // validate cvv
            if ((!valid_length(body.expiration_month, 1) && !valid_length(body.expiration_month, 2)) || !valid_month(body.expiration_month)) throw 'Error length month' // validate month
            if (!valid_year(body.expiration_year) || !valid_length(body.expiration_year, 4)) throw 'Error year' // validate year
            if (body.email.length < 5 || body.email.length > 100 || !valid_email(body.email)) throw 'Error email' // validate email
            const cards = await db.collection("cards").insertOne(body);
            response = {
                statusCode: 200,
                body: JSON.stringify(cards),
            };
        } catch (error) {
            response = {
                statusCode: 400,
                body: error,
            };
        }
        return response;
    }
};
// funciones validadores con nombres que se definen ellos mimos
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
    if (value.length == length) return true;
    return false;
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
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if ((prov[1] === 'gmail.com' || prov[1] === 'hotmail.com' || prov[1] === 'yahoo.es') && regex.test(value)) return true;
    return false;
}
function tokenMiddleware(value) {
    const token = value.split(" ")[1];
    if (token.length == 16 && token.split("_")[0] == "pk" && token.split("_")[1] == "test") return true;
    return false;
}