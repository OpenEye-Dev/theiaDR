import React, { Component } from 'react';
import $ from 'jquery';

class ImgUploader extends Component {

    constructor(){
        super();
        this.state = {
            file: null,
            imagePreviewUrl: null
        }
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleImageChange(event){
        event.preventDefault();

        let reader = new FileReader();
        let file = event.target.files[0];

        reader.onloadend = () => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result
            });
        }

        reader.readAsDataURL(file)
    }

    handleSubmit(event){
        event.preventDefault();
        let file = this.state.file
        if(file !== null && file.type.match('image.*')){
            console.log("Uploaded: " + this.state.file.name);

            $.ajax({
                url: "http://10.34.64.114:8080/api/v1/grade",
                //url: "http://localhost:8081/upload",
                data: file.data,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    alert(data);
                }
            });

        }else{
            alert("Choose an image first!");
        }
    }

    render() {

        let className = 'ImgUploader';
        let {imagePreviewUrl} = this.state;
        let $imagePreview = null;
        if (imagePreviewUrl && this.state.file.type.match('image.*')) {
            $imagePreview = (<img className="imgPreview" src={imagePreviewUrl} alt="pic"/>);
        }

        return (
            <div className={className}>
                <h3>Image uploader</h3>
                <form action={this.handleSubmit}>
                    <input onChange={this.handleImageChange} type="file" placeholder="Choose a file" />
                    <button type="submit" onClick={this.handleSubmit}>Upload Image</button>
                </form>
                {$imagePreview}
            </div>
        );
    }
}

export default ImgUploader;