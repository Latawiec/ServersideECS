
import {
    BlobReader,
    BlobWriter,
    TextReader,
    TextWriter,
    ZipReader,
    ZipWriter,
  } from "@zip.js/zip.js";


function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}

const zipFileReader = new BlobReader(readTextFile("file:///D:\\Programming\\FFXIVSavagePlayground\\Test\\unzip\\TestWorld.zip"));
const zipReader = new ZipReader(zipFileReader);

async function somefunc(){
  const entries = await zipReader.getEntries();
  console.log(entries);
}
somefunc();
console.log('hello world')