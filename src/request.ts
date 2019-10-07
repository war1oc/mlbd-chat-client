import xhr from 'xhr'

export function post(uri: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    xhr(
      {
        method: 'POST',
        uri: uri,
        json: true,
        body: body
      },
      (err, resp, body) => {
        if (err) {
          return reject(err)
        }

        if (resp.statusCode < 200 || resp.statusCode >= 300) {
          return reject(body)
        }

        return resolve(body)
      }
    )
  })
}
