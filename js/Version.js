/*
 * The MIT License
 *
 * Copyright (c) 2016, CloudBees, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function Version(version) {
    this.raw = version;

    // Remove leading non alphanum chars e.g. to
    // convert "^1.2.3" to "1.2.3". If the version is something
    // like "any" then the string will be trimmed to nothing and
    // the next check catches it.
    version = version.replace(/^(\D)/, "");
    
    if (!version || version.length === 0) {
        return;
    }
    
    function normalizeToken(string) {
        // remove anything that's not a digit, a dot or an x.
        var normalized = string.replace(/[^\d]/g, '');
        if (normalized === '') {
            return undefined;
        }
        return normalized;
    }
    
    var versionTokens = version.split('.');
    
    this.prerelease = undefined;
    
    var patchAndPrerelease = '';
    for (var i = 2; i < versionTokens.length; i++) {
        if (patchAndPrerelease.length > 0) {
            patchAndPrerelease += '.';
        }
        patchAndPrerelease += versionTokens[i];
        
        var separatorIdx = patchAndPrerelease.indexOf('-');
        if (separatorIdx !== -1) {
            this.patch = normalizeToken(patchAndPrerelease.substring(0, separatorIdx));
            this.prerelease = patchAndPrerelease.substring(separatorIdx + 1);
        } else {
            this.patch = normalizeToken(patchAndPrerelease);
        }
    }
    
    if (versionTokens.length >= 2) {
        this.minor = normalizeToken(versionTokens[1]);
    }
    if (versionTokens.length >= 1) {
        this.major = normalizeToken(versionTokens[0]);
    }    
}

Version.prototype.isSpecific = function() {
    return (this.major !== undefined && this.minor !== undefined && this.patch !== undefined);
};

/**
 * Get the "base" version string for this version number.
 * <p/>
 * This string should only ever include the major, minor and patch tokens
 * of the version i.e. should never include a prerelease tag.
 * @returns {string}
 */
Version.prototype.asBaseVersionString = function(separator) {
    separator = (separator ? separator : '.');
    
    if (!this.major || this.major === 'x') {
        if (this.raw === 'any') {
            return this.raw;
        } else {
            return undefined;
        }
    } else if (!this.minor || this.minor === 'x') {
        return this.major + separator + 'x';
    } else if (!this.patch || this.patch === 'x') {
        return this.major + separator + this.minor + separator + 'x';
    } else {
        return this.major + separator + this.minor + separator + this.patch;
    }
};

/**
 * Get the load version string for this version number.
 * <p/>
 * This string should only ever include the major, minor and patch tokens
 * of the version i.e. should never include a prerelease tag. This function
 * just calls <code>asBaseVersionString</code>, supplying a hyphen as the
 * separator.
 * @returns {string}
 */
Version.prototype.asLoadVersionString = function() {
    return this.asBaseVersionString('-');
};

module.exports = Version;