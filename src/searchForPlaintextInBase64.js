// arguments: plaintext, base64string
function searchForPlainTextInBase64(plaintext, base64string){
    let bEnc = Buffer.from(base64string, 'base64');
    let bPlain = Buffer.from(plaintext);
    let fullString = bEnc.toString('hex')
    let searchString = bPlain.toString('hex')
    let start = fullString.indexOf(searchString)
    if (start == -1) { return null }
    finish = start + searchString.length
    // console.log(bEnc.toString('hex'), bPlain.toString('hex'));
    // console.log(bEnc, bPlain);
    // for(i=0; i<bEnc.length; i++){
    //     let finish = i+bPlain.length
    //     if(bEnc.slice(i,finish) == bPlain){return [i, finish]}
    // }
    return [start, finish];
}

function searchForPlainTextInBase64Url(plaintext, base64UrlString) {
    searchForPlainTextInBase64(plainText, base64UrlString.replaceAll('-', '+').replaceAll('_', '/'))
}


let result = searchForPlainTextInBase64('0000-0002-2308-9517', 'eyJhdF9oYXNoIjoiX1RCT2VPZ2VZNzBPVnBHRWNDTi0zUSIsImF1ZCI6IkFQUC1NUExJMEZRUlVWRkVLTVlYIiwic3ViIjoiMDAwMC0wMDAyLTIzMDgtOTUxNyIsImF1dGhfdGltZSI6MTY0NDgzMDE5MSwiaXNzIjoiaHR0cHM6XC9cL29yY2lkLm9yZyIsImV4cCI6MTY0NDkxODUzNywiZ2l2ZW5fbmFtZSI6Ik5hbmFrIE5paGFsIiwiaWF0IjoxNjQ0ODMyMTM3LCJmYW1pbHlfbmFtZSI6IktoYWxzYSIsImp0aSI6IjcxM2RjMGZiLTMwZTAtNDM0Mi05ODFjLTNlYjJiMTRiODM0OCJ9')
console.log(result)