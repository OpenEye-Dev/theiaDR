// precondition: img is a valid image file that has been checked
// before it is called
// return: dataurl of the resized img
function previewImg(img)
{
    // resize img so that longest size is at max, 512
    var MAX_WIDTH = 512;
    var MAX_HEIGHT = 512;
    var width = img.width;
    var height = img.height;

    console.log(width);
    console.log(height);

    if (width > height)
    {
        if (width > MAX_WIDTH)
        {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    }
    else
    {
        if (height > MAX_HEIGHT)
        {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }

    canvas.width = width;
    canvas.height = height;
    console.log(canvas.width);
    console.log(canvas.height);
    console.log(width);
    console.log(height);

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // clear holder and append resized img
    holder.innerHTML = '';
    holder.appendChild(canvas);

    var dataurl = canvas.toDataURL();
    //console.log(canvas.toDataURL());
    return dataurl;
}

// dataurl: is a dataurl of an image
// filename: string containing file's name
function sendFile(dataurl, filename)
{
    var formData = tests.formdata ? new FormData() : null;
    var passesTest = tests.formdata;

    result.innerHTML = 'Uploading and Processing Image...';

    if (passesTest)
    {
        formData.append('filename', filename);
        formData.append('file', dataurl);

        // now send form over to flask
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload');
        xhr.onload = function()
        {
            progress.value = progress.innerHTML = 100; // completed analysis
        };
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState == 4)
            {
                result.innerHTML = '<p>Estimated severity: ' + xhr.responseText.slice(1, 6) + '</p>';
                progress.value = progress.innerHTML = 0;
            }
        }
        if (tests.progress)
        {
            xhr.upload.onprogress = function(event)
            {
                if (event.lengthComputable)
                {
                    var complete = (event.loaded / event.total * 100 | 0);
                    progress.value = progress.innerHTML = complete;
                }
            }
        }
        xhr.send(formData);
    }
}

// precondition: img is a valid img file that's been checked by
// the function that calls processImg
function processImg(e, filename)
{
    var img = document.createElement('img')
    img.src = e.target.result;

    var dataurl = previewImg(img);
    console.log(dataurl);
    sendFile(dataurl, filename);
}

// readfiles takes the file uploads and sends the valid uploads
// to flask
function readFiles(files)
{
    for (var i = 0; i < files.length; i++)
    {
        var file = files[i]
        if (tests.filereader === true && acceptedTypes[file.type] === true)
        {
            var reader = new FileReader();
            holder.innerHTML = 'Image Uploading and Processing...';

            reader.onload = function(e)
            {
                processImg(e, file.name);
                console.log(file);
            }
            reader.readAsDataURL(file);
        }
        else
        { // if the file isn't accepted
            holder.innerHTML = '<p>Uploaded ' + file.name + ' ' + (file.size ? (file.size / 1024 | 0) + 'K' : '') + '<br>Try again?';
            console.log(file);
        }
    }
}