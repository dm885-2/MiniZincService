import rapid from "@ovcina/rapidriver";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET ?? `3(?<,t2mZxj$5JT47naQFTXwqNWP#W>'*Kr!X!(_M3N.u8v}%N/JYGHC.Zwq.!v-`;  // JWT secret
const rabbitUser = process.env.rabbitUser ?? "guest";
const rabbitPass = process.env.rabbitPass ?? "guest";
export const host = "amqp://" + rabbitUser + ":" + rabbitPass + "@" + (process.env.rabbitHost ?? `localhost`);  // RabbitMQ url

/**
 * Automatically adds logging, request and sessionIDs to rabbit responses.
 * @param stromg host 
 * @param [] subscribers 
 */
 export function subscriber(host, subscribers)
 {
     rapid.subscribe(host, subscribers.map(subscriber => ({
         river: subscriber.river,
         event: subscriber.event,
         work: (msg, publish) => {
             const wrappedPublish = (event, data) => {
                let logPath = msg.logPath ?? [];
                logPath.push({
                    river: subscriber.river, 
                    event: subscriber.event
                });

                publish(event, {
                    ...data,
                    sessionId: msg.sessionId,
                    requestId: msg.requestId,
                    logPath
                });
             };
             subscriber.work(msg, wrappedPublish);
         },
     })));
}

/**
 * Returns the token payload if its valid, otherwise it returns false.
 * @param String token 
 * @returns Promise<false|TokenData>
 */
export function getTokenData(token)
{
    return new Promise(resolve => jwt.verify(token, SECRET, (err, data) => resolve(err ? false : data)));
}

/**
 * Runs a SQL query on the DB. 
 * @param string stmt 
 * @param ?string[] WHERE 
 * @returns results[]|false
 */
export function query(stmt, WHERE = [])
{
    return new Promise(r => connection.query(stmt, WHERE, (err, results) => r(err ? false : results)));
}