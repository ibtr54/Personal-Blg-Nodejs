import express, { response } from "express";
import bodyParser from "body-parser";
//import fs from "file-system"
import * as fs from 'node:fs';
import readLine from "readline";

import { request } from "node:http";
import { title } from "node:process";

var app = express();
const port = 3002;

app.use( bodyParser.urlencoded( {extended: true} ));
app.use( express.static("public") );

var blogs = [];
function readBlogs(){

return new Promise((resolve, reject) => {
    blogs = [];
    const fileStream = fs.createReadStream("blogs.txt");
    const _readLine = readLine.createInterface({ input: fileStream, crlfDelay: Infinity });
    //const blogs = [];
    _readLine.on('line', (line) => {
        var textLine = line.split("|");
        blogs.push({ title: textLine[0], date: textLine[1] });
    });
    _readLine.on('close', () => {
        resolve(blogs);
    });
    _readLine.on('error', (err) => {
        reject(err);
    });
});
}

var adminWebMessage = ["popoyote", "bart simpson", "Disfruta de una coca-cola"];

var welcomeMessage1 = "Lorem ipsum potenti quisque tempus varius potenti, tristique quisque pretium velit mi in, aliquet ante ultricies suscipit netus. Suspendisse nullam sem vulputate magna suspendisse litora, quam cras enim euismod faucibus lectus, lacus sem sit aptent proin. Morbi id quis pellentesque taciti venenatis habitasse cursus semper fusce ornare, mauris porta senectus malesuada maecenas et sapien sodales tristique sagittis class, hac imperdiet metus vel at interdum posuere duis ac.";
var welcomeMessage2 = "Senectus duis etiam donec pretium ante justo convallis cras metus, congue pellentesque consequat venenatis amet proin mollis euismod, nisi conubia hac urna morbi potenti risus dictumst. Consequat proin est egestas in elit condimentum sociosqu lectus duis, conubia mollis condimentum scelerisque semper aliquet maecenas. Ultricies in leo mauris risus porttitor luctus dolor curabitur magna netus aptent duis proin, nisi eu faucibus euismod non vitae maecenas tortor ipsum sem eu laoreet.";


app.get( "/", ( request, response )=>{
    
readBlogs()
.then(() => {
    response.render("welcome.ejs", { blogsList: blogs, titleMessage: "Welcome", wmessage1: welcomeMessage1, wmessage2: welcomeMessage2, adminMessage: adminWebMessage[Math.floor(Math.random() * adminWebMessage.length)] }, (error, html) => {
        if (error) console.log(error);
        response.send(html);
    });
})
.catch((err) => {
    console.error(err);
    response.status(500).send("Internal Server Error");
});
});

app.get("/createablog", ( request, response )=>{
    response.render( "createblog.ejs", { blogsList:blogs, adminMessage: adminWebMessage[ Math.floor( Math.random() * adminWebMessage.length )]}, ( error, html )=>{
        if( error != undefined ) console.log( error ); 
        response.send( html );
    } );
});

app.get("/blog_welcome", ( request, response )=>{
    response.redirect("/");
});

app.post( "/submit", ( request, response )=>{
    let dateData = new Date();
    let title;
    let textBody;
    title = request.body._title;
    
    textBody = request.body._text;
    if( title != undefined && textBody != undefined ){
        fs.appendFile( `./public/blogs/${title}.txt`, textBody, ( error )=>{
            if( error ){
                //Send Error Message
                response.redirect("/");
            }
            else {
                //Everything is correct
                let writer = fs.createWriteStream( "blogs.txt", { flags: 'a' } );
                writer.write( `\n${title}|Created ${dateData.getDate()}/${dateData.getMonth()+1}/${dateData.getFullYear()}` );
                writer.close(()=>{ readBlogs().then( ( )=>{response.render( "welcome.ejs", { blogsList: blogs, titleMessage: "Blog Created", wmessage1: "Your Blog was created succesfully", wmessage2: "Check the lastest blogs", adminMessage: adminWebMessage[Math.floor(Math.random() * adminWebMessage.length)]} );}); 
            });
            }
        } );
        
    }

} );

app.get( "/blog_*", ( request, response )=>{
    
        var insertedURL = request.url;
        var urlSplited = insertedURL.split("_");
        urlSplited[1] = urlSplited[1].replace(/%20/gi," ");
        fs.readFile( `./public/blogs/${urlSplited[1]}.txt`, "utf8", ( _error, data)=>{
            if(_error){
                //Send 404 error
                console.log(_error);
                response.status(404).render( "welcome.ejs", { blogsList:blogs, titleMessage: "Error 404: Not Found." ,wmessage1: "Sorry the blog that you are looking for, doesn't exist.", wmessage2: "", adminMessage: adminWebMessage[ Math.floor( Math.random() * adminWebMessage.length )] }, ( error, html )=>{
                    if( error != undefined ) console.log( error ); 
                    response.send( html );
                } );
                
                return;
            }
            // Send blog data
            
            response.render( "welcome.ejs", { blogsList:blogs, titleMessage: urlSplited[1] ,wmessage1: data , wmessage2: "", adminMessage: adminWebMessage[ Math.floor( Math.random() * adminWebMessage.length )] }, ( error, html )=>{
                if( error != undefined ) console.log( error ); 
                response.send( html );
            } );
        } );
    
} );

app.listen( port, ()=>{
    console.log( `Server running on port ${port}` );
} );
