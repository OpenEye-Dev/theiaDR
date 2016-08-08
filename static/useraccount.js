/*  username must be between min and max number of characters long */
function validate_uid(uid, min, max)
{
    console.log(uid.value.length);
    if(uid.value.length <= max && uid.value.length >= min)
        return true;
    return false;
}

/*  password must contain between min and max number of characters long, and it 
    must contain at least 1 number */
function validate_pw(pw, min, max)
{
    pass = pw.value;
    
    if(pass.length >= max || pass.length <= min)
        return false;
    
    var containsNum = false;
    for(var i = 0, len = pass.length; i<len; i++)
    {
        if(!isNaN(parseFloat(pass.substring(i, i+1))) && isFinite(pass.substring(i, i+1)))
            containsNum = true;
    }
    
    return containsNum;
    
}

function validate_signup(uid, pw, min, max)
{
    // email should be auto-validated by the "email" field
    // all fields are required
    var uid_okay = validate_uid(uid, min, max);
    var pw_okay = validate_pw(pw, min, max);
    console.log(uid_okay);
    console.log(pw_okay);
    if(! uid_okay)
    {
        if(! pw_okay)
            alert("Please select a valid username and password.");
        else
            alert("Please select a valid username.");
    }
    else if(! pw_okay)
        alert("Please select a valid password.");
    
    if(uid_okay && pw_okay)
        return true;
    return false;
}

function signup(form)
{
    var uid = form.elements["uid"];
    var password = form.elements["password"];
    
    if (! validate_signup(uid, password, 4, 12))
        return false;
    
    alert("You have successfully signed up!");
    var formData = new formData();
    
    formData.append('uid',uid);
    formData.append('password',password);
    formData.append('firstname',firstname);
    formData.append('lastname',lastname);
    formData.append('email',email);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/signup');
    
	xhr.send(formData);
    return true;
}

function signin(form)
{ 
    var uid = form.elements["uid"];
    var password = form.elements["password"];
    
    var formData = new formData();
    formData.append('uid',uid);
    formData.append('password',password);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/signin');
    
	xhr.send(formData);
}