import React, { Component } from 'react';

class ImgUploader extends Component {
    render() {
        return (
            <div className="ImgUploader">
                <h3>Image uploader</h3>

            </div>
        );
    }
}

/* Optional: Manual type checking */
ImgUploader.propTypes = {
    //sectionsArray: React.PropTypes.array,
    //onDelete: React.PropTypes.func
}

export default ImgUploader;