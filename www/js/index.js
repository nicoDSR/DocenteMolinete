var server = "http://192.168.1.146:8081";
var deviceType;
var store;
var pictureSource; 
var destinationType; 
var docente;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event 
    receivedEvent: function(id) {
    
        console.log('Received Event: ' + id);
         deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) ==  "BlackBerry" ? "BlackBerry" : "null";
        if (deviceType == "iPhone"){
            store = cordova.file.documentsDirectory;
        }
        else if (deviceType == "Android"){
            store = cordova.file.externalDataDirectory;
        }
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
        $.get( server+"/checkAuth/docentes/"+device.uuid, function( data ) {
            if (data == 'noautorizado'){
                console.log(data);
                $(':mobile-pagecontainer').pagecontainer('change', '#login', {
                    transition: 'flip',
                    changeHash: false,
                    reverse: true,
                    showLoadMsg: true
                });
            }
            else{
                $.getJSON( server+"/docenteMovilId/"+device.uuid, function( data ) {
                    console.log(data);
                    docente = data;
                     $("#mainTitle").html(data.nombres +" "+ data.apellidos); 

                     $.getJSON( server+"/clasesDelDocente/"+data._id, function( data0 ) {
                        var clasesDocenteListHTML = ""; 
                       $.each( data0, function( key, val ) {
                        clasesDocenteListHTML += "<option  value='"+val._id+"'>"+val.nombre+"</option>";
         
                        }); 
                        //clasesDocenteListHTML += "<option  selected=\"selected\" value=\""+data0[0]._id+"\">"+data0[0].nombre+"</option>";
                       $("#clasesDocenteList").html(clasesDocenteListHTML); 
                       $("#clasesDocenteList").selectmenu("refresh");
                       refreshAlumnosGeneral();

                    });  
                     
     
                });               
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var errorHtml = "<p>"+jqXHR.responseText+"</p>";
            errorHtml += "<p> Código de error: "+jqXHR.status+"</p>";
            errorHtml += "<p> Llamada: Error de conexión al servidor</p>";
            errorHtml += "<p>Pruebe reiniciar la aplicación luego.</p>";
            $("#errorMsgPrincipal").html(errorHtml);
            console.log( "error "+jqXHR.responseText  ); 
        });


        
    }
}; 

function inicializarDocente(){
    $.getJSON( server+"/docenteMovilId/"+device.uuid, function( data ) {
                docente = data;
                 $("#mainTitle").html(data.nombres +" "+ data.apellidos);

                 $.getJSON( server+"/clasesDelDocente/"+data._id, function( data0 ) {
                    var clasesDocenteListHTML = ""; 
                   $.each( data0, function( key, val ) {
                    clasesDocenteListHTML += "<option  value='"+val._id+"'>"+val.nombre+"</option>";
     
                    }); 
                    //clasesDocenteListHTML += "<option  selected=\"selected\" value=\""+data0[0]._id+"\">"+data0[0].nombre+"</option>";
                   $("#clasesDocenteList").html(clasesDocenteListHTML);
                   $("#clasesDocenteList").selectmenu("refresh");
                   refreshAlumnosGeneral();

                });
                 
     
            });
}


function ingresar(){
    var error = false;
    var ci = $("#cidocente").val();
    var codigo = $("#code").val();
    if (ci == '' || ci == null){
        $("#cidocenteerror").val("Debe ingresar este campo.");
        error = true;
    }
    if (codigo == '' || codigo == null){
        $("#codeerror").val("Debe ingresar este campo.");
        error = true;
    }
    if (!error){ 
         $.get( server+"/ingresar/docentes/"+ci+"/"+device.uuid+"/"+codigo, function( data ) {
            console.log(data );
            if (data == 'ok'){
                inicializarDocente();
               $(':mobile-pagecontainer').pagecontainer('change', '#docenteGeneral', {
                transition: 'flip',
                changeHash: false,
                reverse: true,
                showLoadMsg: true 
                });
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
        var errorHtml = "<p>"+jqXHR.responseText+"</p>";
        errorHtml += "<p> Código de error: "+jqXHR.status+"</p>";
        errorHtml += "<p> Llamada: Primera llamada a getAsistenciario()</p>";
        errorHtml += "<p>Pruebe reiniciar la aplicación luego.</p>";
        $("#errorMsg").html(errorHtml);
        console.log( "error "+jqXHR.responseText  );
    });
     }
}


/*****************************************************
FUNCIONES DE IMAGEN
*****************************************************/

function getPhoto() {
  // Obtiene una foto almacenada en el dispositivo.
  if (deviceType == "iPhone"){
    navigator.camera.getPicture(getPhotoSuccess, getPhotoFail, { 
    quality: 50, 
    targetWidth: 600,
    targetHeight: 600,
    destinationType: navigator.camera.DestinationType.FILE_URI,
    sourceType: pictureSource.SAVEDPHOTOALBUM });
  }
  else {
    navigator.camera.getPicture(getPhotoSuccess, getPhotoFail, { 
    quality: 50,
    targetWidth: 600,
    targetHeight: 600,
    destinationType: Camera.DestinationType.FILE_URI, //ME gustaria más usar FILE_URI pero hay bug con android
    sourceType: pictureSource.PHOTOLIBRARY});
    }
}

function getPhotoSuccess(imageURI) {
//Si la selección de la foto fue exitosa, se retorna esta función.
//La imagen se carga en #image.
//imageURI es el parámetro dónde obtenemos la ruta de la 
//imagen en el móvil.
    $("#image").css("display", "block");
    if (deviceType == "iPhone"){
         $("#image").attr("src", imageURI);

    }
    else{
        var imgContenido = "data:image/jpeg;base64," + imageURI;
        //alert(imageURI);
        var imageURIAux = imageURI.split("?");
        imageURI = imageURIAux[0];
        $("#image").attr("src", imageURI);
    }
    var f = imagenForm();
    $("#imagenInfoForm").html(f);    
    $("#textarea-imagen-nombre").textinput();     
    $("#formularioDatosImagen").css("display", "block");
    $("#textarea-imagen-nombre").val("Nombre de la foto");
    //Habilito el botón que permita subir la imagen al servidor.
     $('#btnUploadImagen').css("display","block");
     getAlumnosFromClase("#alumnosListImagen");


}

function imagenForm(){
    var f = "<form>";
    f += "<label for='textarea-imagen-descripcion'>Descripción</label>";
    f += "<textarea name='textarea-imagen-descripcion' id='textarea-imagen-descripcion'></textarea>";
    f += "<label for='textarea-imagen-nombre'>Nombre</label>";
    f += "<input type=\"text\" name=\"textarea-imagen-nombre\" id=\"textarea-imagen-nombre\" value=\"\" data-clear-btn=\"true\">";    
    f += "</form>";
    return f;
}


function getPhotoFail(message) {
    alert('Failed because: ' + message);
}


function capturePhoto() {
//Toma la foto usando la cámara del dispotivo y la retorna como una imagen
//base64-enconded
//Si es un caso de éxito llama a onPhotoDataSuccess, en caso contrario,
//llama a onFail.

    navigator.camera.getPicture(capturePhotoSuccess, capturePhotoFail, {
        quality: 30,
        targetWidth: 600,
        targetHeight: 600,
        destinationType: destinationType.FILE_URI
    });
}

function capturePhotoSuccess(imageURI) {
//Si la toma de foto fue exitosa, se retorna esta función.
//La imagen se carga en #image.
//imageURI es el parámetro dónde obtenemos la ruta de la 
//imagen en el móvil.
    $("#image").css("display", "block");
    $("#image").attr("src", imageURI);
    var f = imagenForm();
    $("#imagenInfoForm").html(f);  
    $("#textarea-imagen-nombre").textinput();       
    $("#formularioDatosImagen").css("display", "block");
    $("#textarea-imagen-nombre").val("Nombre de la foto");
    //Habilito el botón que permita subir la imagen al servidor.
     $('#btnUploadImagen').css("display","block");
     getAlumnosFromClase("#alumnosListImagen");

}

function capturePhotoFail(message){
    alert('Falla en la captura de la imagen. Motivo: ' + message);
}

function checkInfoImagen(){
    var ok = true;
    if ($('#textarea-imagen-nombre').val() == ""){
        ok = false;
    }
    if ($("#alumnosListImagen").val() == null){
        ok = false;
    }
    return ok;
}

function uploadImagen() {
    //Descripción: Esta función es utilizada para subir las imágenes.
    //Pido el área donde está la imagen.
    console.log('En uploadImagen');
    //var img = $("#image");
    //console.log(img);
    //Pido el "source" de la imagen. Notar que en las funciones
    //capturePhotoSuccess y getPhotoSuccess se carga el source
    var imageURI = $("#image").attr("src");
    //Creo las opciones. Es parte de FileTransfer.
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    //Dentro de las opciones puedo agregar parámetros, los cuáles viajan 
    //en el body del post en formato json.
    console.log(checkInfoImagen());
    if (checkInfoImagen()){
        var params = new Object();
        params.docente = device.uuid;
        params.descripcion = $('#textarea-imagen-descripcion').val();
        params.nombre = $('#textarea-imagen-nombre').val(); //Nombre fantasía (no es el nombre del archivo)
        params.alumnos = $("#alumnosListImagen").val().toString(); //&deteccion de error. 
        params.tipo = "Imagen";
        params.docenteId = docente._id;
        params.validado = docente.permisoPublicar;
        params.rechazado = false;
        options.params = params;
        options.chunkedMode = false;
        //Creo la variable que hara la transferencia y realizo el upload.
        var ft = new FileTransfer();
        ft.upload(imageURI, server+"/subirImagen", uploadImagenSuccess, uploadImagenFail,
            options);
    }
    else{
        alert('Hay campos incompletos');
    }
}

function uploadImagenSuccess(r){
    //Descripción: Llamado cuando uploadVideo fue exitoso.
    var galleryImage = document.getElementById('image');
    galleryImage.style.display = 'none';
    galleryImage.src = "";
    $("#imagenInfoForm").html("");    
    $("#formularioDatosImagen").css("display", "none");  
    $('#btnUploadImagen').css("display","none");
    $("#alumnosListImagen").html(""); 

}

function uploadImagenFail(message){
    alert('Falla en la subida de la imagen. Motivo: ' + message);
}

/*****************************************************
end FUNCIONES DE IMAGEN
*****************************************************/


/*****************************************************
FUNCIONES DE VIDEO
*****************************************************/
function getVideo(){
//Busca el video en el dispositivo.    
//Si es un caso de éxito llama a onVideoURISuccess, en caso contrario,
//llama a onFail.
    if (deviceType == "iPhone"){
        navigator.camera.getPicture(getVideoSuccess, getVideoFail, {
            destinationType: destinationType.FILE_URI,
            sourceType: pictureSource.PHOTOLIBRARY, 
            mediaType: 1
        });
    }
    else{
        navigator.camera.getPicture(getVideoSuccess, getVideoFail, {
            destinationType: destinationType.FILE_URI,
            sourceType: pictureSource.PHOTOLIBRARY, 
            mediaType: 1
        });
    }
}

function captureVideo(){
//Abre la cámara para filmar un video.
   navigator.device.capture.captureVideo(captureVideoSuccess, captureVideoFail, {limit: 1});
}

function checkInfoVideo(){
    var ok = true;
    if ($('#textarea-video-nombre').val() == ""){
        ok = false;
    }
    if ($("#alumnosListVideo").val() == null){
        ok = false;
    }
    return ok;
}

function uploadVideo() {
    //Descripción: Esta función es utilizada para subir un video.
    //Pido el sector del DOM donde se encuentra el video.
   //var img = document.getElementById('videoup');
    //Pido el source del video.
    //var imageURI = img.src;
    var imageURI = $("#videoup").attr("src");
    if (checkInfoVideo()){
        //Inicializo las options del FileUpload.
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "video/mp4";
        //Le agregamos parametros al post que viajan en el body 
        //en formato JSON
        var params = new Object();
        options.params = params;
        params.tipo = "Video";
        params.docente = device.uuid;
        params.docenteId = docente._id;
        params.validado = docente.permisoPublicar;
        params.descripcion = $('#textarea-video-descripcion').val();
        params.nombre = $('#textarea-video-nombre').val();
        params.alumnos = $("#alumnosListVideo").val().toString();
        options.chunkedMode = false;
        //Realizamos la transferencia.
        console.log(params);
        var ft = new FileTransfer();
        ft.upload(imageURI, server+"/subirVideo", uploadVideoSuccess, uploadVideoFail,
            options);
    }
    else{
        alert('Hay campos incompletos');
    }
}
 
function uploadVideoSuccess(r){
    //Descripción: Llamado cuando uploadVideo fue exitoso.

    $("#videoArea").html("");
    $("#videoInfoForm").html("");
    $("#formularioDatosVideo").css("display", "none");
    $("#btnUploadVideo").css("display", "none");
    $("#alumnosListVideo").html("");

}

function uploadVideoFail(message){
    alert('Falla en la subida de video. Motivo: ' + message);
}

function captureVideoFail(e) {
    console.log("Falla en la subida de video. Motivo: "+JSON.stringify(e));
}

function captureVideoSuccess(s) {
    loadVideo(s[0].fullPath);
}

function getVideoSuccess(videoURI) {
//Si la selección del video fue exitosa, se retorna esta función.

    loadVideo(videoURI);
}

function getVideoFail(message){
    if (message != 'no image selected'){
        alert('Falla en la subida de video. Motivo: ' + message);
    }
}

function loadVideo(videoReference){
    //Se inyecta el elemento <video> en videoArea. 
    //El source del video lo obtenemos de videoURI
    var v = "<video controls='controls'  width=\"320\" height=\"240\">";
    //if (deviceType == "iPhone"){
    if (true){    
        v += "<source id='videoup' src='" + videoReference + "' type='video/mp4'>";
        //v += "<source id='videoup' src='" + videoReference + "' type='video/ogg'>";
    }
    else{
        v += "<source id='videoup' src='data:video/mp4;base64," + videoReference + "' type='video/mp4'>";
    }
    v += "</video>";
    $("#videoArea").html(v);
    var f = "<form>";
    f =        "<label for='textarea-video-descripcion'>Descripción</label>";
    f +=        "<textarea name='textarea-video-descripcion' id='textarea-video-descripcion'></textarea>";
    f +=        "<label for='textarea-video-nombre'>Nombre</label>";
    f += "<input type=\"text\" name=\"textarea-video-nombre\" id=\"textarea-video-nombre\" value=\"\" data-clear-btn=\"true\">";
    f +=    "</form>";                  
    $("#videoInfoForm").html(f);
    $("#textarea-video-nombre").textinput();    
    $("#formularioDatosVideo").css("display", "block");
    $("#textarea-video-nombre").val("Nombre del video");
    $("#btnUploadVideo").css("display", "block");
    getAlumnosFromClase("#alumnosListVideo");

}

/*****************************************************
end FUNCIONES DE VIDEO
*****************************************************/

/*****************************************************
FUNCIONES DE PEDIDO DE ALUMNOS E INSERCIÓN EN DOM
*****************************************************/

function refreshAlumnosGeneral(){
//Se carga en cada lugar donde se necesita ver los alumnos.    
//Se pide la lista de alumnos para una determinada clase al servidor.
    alumnosDeClaseActual = "";
       $.getJSON( server+"/alumnosDeClase/"+$("#clasesDocenteList").val(), function( data ) {
        alumnosDeClaseActual = "";
        $.each( data, function( key, val ) {
          alumnosDeClaseActual += "<option selected=\"selected\" value="+val._id+">"+val.nombres+" "+val.apellidos+"</option>";

        });
        if ($("#alumnosListVideo").html() != ""){
            $("#alumnosListVideo").html(alumnosDeClaseActual);
            $("#alumnosListVideo").selectmenu("refresh");
        }
        if ($("#alumnosListImagen").html() != ""){
            $("#alumnosListImagen").html(alumnosDeClaseActual);
            $("#alumnosListImagen").selectmenu("refresh");
        }
        $("#alumnosListComunicado").html(alumnosDeClaseActual);
        $("#alumnosListComunicado").selectmenu("refresh");

    });
}

function getAlumnosFromClase(idListHtml){
//Esta función carga la lista de alumnos disponibles para una clase determinada, con el 
//fin de que el docente pueda seleccionar a cual corresponde asociarlo.
//Recibe como parámetro el id del elemento del DOM donde se insertará.
    $.getJSON( server+"/alumnosDeClase/"+$("#clasesDocenteList").val(), function( data ) {
        var listAlumnosHTML = "";
        $.each( data, function( key, val ) {
          listAlumnosHTML += "<option selected=\"selected\" value="+val._id+">"+val.nombres+" "+val.apellidos+"</option>";

        });
        $(idListHtml).html(listAlumnosHTML);
        $(idListHtml).selectmenu("refresh");
    });

}

/*****************************************************
end FUNCIONES DE PEDIDO DE ALUMNOS E INSERCIÓN EN DOM
*****************************************************/

/*****************************************************
FUNCIONES DE COMUNICADOS
*****************************************************/

function sendComunicado(){
//Envía el comunicado al servidor.
//Falta: Capturar success o error y manejar esas situaciones.
    
    var titulo = $("#comunicadoTitle").val();
    var cuerpo = encodeURIComponent($("#comunicadoContent").val());
    if (titulo != "" && cuerpo != "" && $("#alumnosListComunicado").val() != null){
        var dataSend = {"docente" : device.uuid, "titulo" : titulo, "cuerpo" : cuerpo, "docenteId" : docente._id, "validado" : docente.permisoPublicar,
             "alumnos" : $("#alumnosListComunicado").val().toString()};
        var url = server+"/subirComunicado";
        $.post(url, dataSend,'json');
        $("#comunicadoTitle").val("");
        $("#comunicadoContent").val("");
    }
    else{
        alert("Falta información");
    } 
    

}

/*****************************************************
end FUNCIONES DE COMUNICADOS
*****************************************************/


/*****************************************************
FUNCIONES DE CONTENIDOS
*****************************************************/

function loadContenidosDocente(){
//Se piden todos los contenidos de los docentes y se inyectan
//en la sección de contenidos.
    //Borro las listas (evitando duplicar contenidos)
    $("#listaDeVideos").html("");
    $("#imagenPanel").html("");
    $("#comunicadosPanel").html("");
    //Pido todos los contenidos del docente.
    //Y los proceso dependiendo que tipo de contenido sea.
    var iteratePhoto = 0;
    var htmlInterior = "";
    $.getJSON( server+"/contenidos/"+device.uuid, function( data ) {
        $.each( data, function( key, val ) {
            switch(val.tipo) {
            case "Imagen":
                htmlInterior = "<img class='imagenLink' src='"+server+"/"+val.nombreArchivo+"' height='45' width='45'>";
                $("#imagenPanel").append(htmlInterior);
                iteratePhoto = iteratePhoto + 1;
                break;
            case "Video":
                htmlInterior = "<li><a href=\"#\" class=\"videolink ui-btn ui-btn-icon-right ui-icon-carat-r \" file=\""+val.nombreArchivo+"\">Video: "+val.nombre+"</a></li>";
                $("#listaDeVideos").append(htmlInterior);
                break;
            case "Comunicado" :
                htmlInterior = "<a href='#' class='comunicadoLink' id='"+val._id+"' >"+val.titulo+"</a><br />";
                $("#comunicadosPanel").append(htmlInterior);
                break;    
            }
        });   
        //Cargo los compartamientos de clases.
        //Compartamiento asociado a hacer click en un elmento de la lista de comunicados.
        $(".comunicadoLink").click(function(){
            $.getJSON( server+"/comunicado/"+$(this).attr("id"), function( data0 ) {
                $("#tituloComunicado").html(data0.titulo);
                console.log(data0.cuerpo);
                $("#outputComunicado").val(data0.cuerpo);
            });
        });
        //Compartamiento asociado a hacer click en un elmento de la lista de videos.
        $( ".videolink" ).on( "click", function() {
            checkFileInMobile($( this ).attr("file"));
        });
        $("#listaDeVideos").attr("data-role", "listview");
        //Compartamiento asociado a hacer click en un elmento de la lista de imágenes.
        $(".imagenLink").click(function(){
            var htmlInterior = "<img class='imagenLink' style='margin:0px auto;display:block' src='"+$(this).attr("src")+"' width='50%'>";
            $("#imagenBig").html(htmlInterior);
            $( "#imagenBig" ).popup( "open", {x : 0});
        });  
    });

     
}    



function checkFileInMobile(fileName){
    //Chequea si un archivo existe en el celular o no.

    window.resolveLocalFileSystemURL(store + fileName, 
                                    
            function(fileEntry){ 
                checkAndLoadFile(store+fileName);
            },
            function(error){
                downloadFileAndLoad(fileName);
            });

}

function checkAndLoadFile(ruta){
    //Si ya existe el archivo lo muestra para reproducir.
    console.log("Ya existe");
    //console.log(ruta);
     var v = "<video width=\"320\" height=\"240\" autoplay controls='controls'>";
           v += "<source id='videoup' src='" + ruta + "' type='video/mp4'>";
       v += "</video>";
   $("#verVideo").html(v);
    $("video").focus();
}
function downloadFileAndLoad(nombreArchivo){
    //Si no existe el archivo, primero lo descargo del servidor.
    console.log("No existe el archivo");
    var fileTransfer = new FileTransfer();
    var uri = encodeURI(server+"/"+nombreArchivo);
    var fileURL = store + nombreArchivo;
    fileTransfer.download(
        uri,
        fileURL,
        function(entry) {
            //entry.file(success, fail);

            console.log("download completeee: " + entry.toURL());
           // var v = "<img id='imgNueva' src='"+ entry.toURL()+ "' height='42' width='42'>";
             //  v += "</img>";
             var v = "<video width=\"320\" height=\"240\" autoplay controls='controls'>";
               v += "<source id='videoup' src='" + fileURL + "' type='video/mp4'>";
            v += "</video>";
            $("#verVideo").html(v);

        },
        function(error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
        },
        false,
        {
            headers: {

            }
        }
    );
    
}

/*****************************************************
end FUNCIONES DE CONTENIDOS
*****************************************************/
