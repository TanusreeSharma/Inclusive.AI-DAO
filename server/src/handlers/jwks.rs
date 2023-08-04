use axum::{
    body::Body,
    http::{Response, StatusCode},
    response::IntoResponse,
};

// Wrong kid: https://authjs.web3auth.io/jwks
// Doesn't work: https://api.openlogin.com/jwks (because it doesn't specify ES256 so jwt lib parses wrong)

pub async fn jwks_handler() -> impl IntoResponse {
    // https://api.openlogin.com/jwks
    // {
    //     "keys": [
    //       {
    //         "kty": "EC",
    //         "crv": "P-256",
    //         "x": "PzwlL8X3P1SpXieB8i6z-KzqVEPI8Vu_JysBiGa7dgA",
    //         "y": "7OtaCKJjbNvs3Oo5pmwGkWKm4oJZOiyl2oWb_odopKo",
    //         "kid": "TYOgg_-5EOEblaY-VVRYqVaDAgptnfKV4535MZPC0w0",
    //         "use": "sig", // added (for jwt lib)
    //         "alg": "ES256" // added (for jwt lib)
    //       }
    //     ]
    //   }
    let body = "{\"keys\":[{\"kty\":\"EC\",\"crv\":\"P-256\",\"x\":\"PzwlL8X3P1SpXieB8i6z-KzqVEPI8Vu_JysBiGa7dgA\",\"y\":\"7OtaCKJjbNvs3Oo5pmwGkWKm4oJZOiyl2oWb_odopKo\",\"kid\":\"TYOgg_-5EOEblaY-VVRYqVaDAgptnfKV4535MZPC0w0\",\"use\":\"sig\",\"alg\":\"ES256\"}]}";
    Response::builder()
        .status(StatusCode::ACCEPTED)
        .body(Body::from(body))
        .unwrap()
}
