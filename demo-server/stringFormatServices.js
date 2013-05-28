function pad(string, count) {
    return (new Array(count + 2)).join(string);
}

exports.pad = pad;