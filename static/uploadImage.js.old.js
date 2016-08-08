var done = new Event('uploadDone');

function previewfile(file)
{
    //var canvas = document.createElement("canvas");
	if (tests.filereader === true && acceptedTypes[file.type] === true)
	{
		var reader = new FileReader();
		holder.innerHTML = 'Image Uploading and Processing...';
        
        var img = document.createElement("img");
        //var canvas = document.createElement("canvas");
        
		reader.onload = function(e)
		{
            img.src = e.target.result;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            var MAX_WIDTH = 512;
            var MAX_HEIGHT = 512;
            var width = img.width;
            var height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
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

            holder.innerHTML = '';
            holder.appendChild(canvas);

            var dataurl = canvas.toDataURL();
            //console.log(canvas.toDataURL());
            document.dispatchEvent(done);
            return dataurl;
        }
        reader.readAsDataURL(file);
        console.log(img);
	} else
	{ // if the file isn't accepted
		holder.innerHTML += '<p>Uploaded ' + file.name + ' '
				+ (file.size ? (file.size / 1024 | 0) + 'K' : '');
		console.log(file);
	}
    //dataurl = canvas.toDataURL();
    //console.log(canvas.toDataURL());
    //document.dispatchEvent(done);
    return dataurl;
}
function readfiles(files)
{
	// debugger;
	var formData = tests.formdata ? new FormData() : null;
	var passesTest = tests.formdata;
	for (var i = 0; i < files.length; i++)
	{
		if (passesTest)
		{
            var dataURL = previewfile(files[i]);

            console.log(dataURL);
            console.log(files[i].name);
            //document.addEventListener('uploadDone', formData.append('file', dataURL))
			//formData.append('file', dataURL);
			formData.append('filename', files[i].name);
		}
		result.innerHTML = 'Uploading and Processing Image...';
	}
	// now post a new XHR request
	if (passesTest)
	{
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/upload');
		xhr.onload = function()
		{
			progress.value = progress.innerHTML = 100; // completed upload,
			// progress bar full
		};
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4)
			{
				result.innerHTML = '<p>Estimated severity: '
						+ xhr.responseText.slice(1, 6) + '</p>';
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
	// on complete send a get request for result
}