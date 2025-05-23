use actix_web::{App, HttpResponse, HttpServer, Responder, post, web};
use rusqlite::{Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};

const DB_PATH: &str = "./uncommon.sqlite";

#[derive(Deserialize)]
struct QueryRequest(Vec<String>);

#[derive(Serialize)]
struct QueryResponse(Vec<String>);

#[post("/")]
async fn query_handler(body: web::Json<QueryRequest>) -> impl Responder {
    let words = body.0.0;
    match query_db(words) {
        Ok(results) => HttpResponse::Ok().json(QueryResponse(results)),
        Err(e) => {
            eprintln!("DB Error: {:?}", e);
            HttpResponse::InternalServerError().body("Database query failed")
        }
    }
}

fn query_db(words: Vec<String>) -> SqlResult<Vec<String>> {
    let conn = Connection::open(DB_PATH)?;
    let query = sql_call(words);
    let mut stmt = conn.prepare(&query)?; 
    let mut rows = stmt.query([])?;
    
    
    let mut results = Vec::new();
    while let Some(row) = rows.next()? {
        results.push(row.get(0)?);
    }
    Ok(results)
}

fn sql_call(values: Vec<String>) -> String {
    let quoted: Vec<String> = values
        .into_iter()
        .map(|v| format!("'{}'", v.replace('\'', "''")))
        .collect();

    format!(
        "SELECT * FROM uncommon WHERE word IN ({});",
        quoted.join(", ")
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(query_handler))
        .bind(("127.0.0.1", 7878))?
        .run()
        .await
}
