function formatFileSize(size) {
    var unitOfSize = "B";
    while ((size / 1024 | 0) > 0) {
        if (unitOfSize === "B") {
            unitOfSize = "kB";
        } else if (unitOfSize === "kB") {
            unitOfSize = "MB";
        } else if (unitOfSize === "MB") {
            unitOfSize = "GB";
        } else {
            break;
        }
        size = size / 1024 | 0;
    }

    return size + " " + unitOfSize;
}

exports.formatFileSize = formatFileSize