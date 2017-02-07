/* (c) 2013-2017 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
   @nodoc
*/

@ = require([
  'sjs:std',
  {id:'../base', include: ['GlobalCSS']}
]);


// Taken (and slightly modified) from getmdl.io's _h5bp.css (Apache license):
var CSSNormalize = @GlobalCSS(`
html {
    color: rgba(0,0,0,0.87);
    font-size: 1em;
    line-height: 1.4;
}

/*
 * Remove text-shadow in selection highlight:
 * https://twitter.com/miketaylr/status/12228805301
 *
 * These selection rule sets have to be separate.
 * Customize the background color to match your design.
 */

::selection {
    background: #b3d4fc;
    text-shadow: none;
}

/*
 * A better looking default horizontal rule
 */

hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid rgba(0,0,0,0.12);
    margin: 1em 0;
    padding: 0;
}

/*
 * Remove the gap between audio, canvas, iframes,
 * images, videos and the bottom of their containers:
 * https://github.com/h5bp/html5-boilerplate/issues/440
 */

audio,
canvas,
iframe,
img,
svg,
video {
    vertical-align: middle;
}

/*
 * Remove default fieldset styles.
 */

fieldset {
    border: 0;
    margin: 0;
    padding: 0;
}

/*
 * Allow only vertical resizing of textareas.
 */

textarea {
    resize: vertical;
}

/* ==========================================================================
   Browser Upgrade Prompt
   ========================================================================== */

.browserupgrade {
    margin: 0.2em 0;
    background: #ccc;
    color: #000;
    padding: 0.2em 0;
}

/* ==========================================================================
   Author's custom styles
   ========================================================================== */

















/* ==========================================================================
   Helper classes
   ========================================================================== */

/*
 * Hide visually and from screen readers:
 */

.hidden {
    display: none !important;
}

/*
 * Hide only visually, but have it available for screen readers:
 * http://snook.ca/archives/html_and_css/hiding-content-for-accessibility
 */

.visuallyhidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

/*
 * Extends the .visuallyhidden class to allow the element
 * to be focusable when navigated to via the keyboard:
 * https://www.drupal.org/node/897638
 */

.visuallyhidden.focusable:active,
.visuallyhidden.focusable:focus {
    clip: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    position: static;
    width: auto;
}

/*
 * Hide visually and from screen readers, but maintain layout
 */

.invisible {
    visibility: hidden;
}

/*
 * Clearfix: contain floats
 *
 * For modern browsers
 * 1. The space content is one way to avoid an Opera bug when the
 *    contenteditable attribute is included anywhere else in the document.
 *    Otherwise it causes space to appear at the top and bottom of elements
 *    that receive the clearfix class.
 * 2. The use of table rather than block is only necessary if using
 *    :before to contain the top-margins of child elements.
 */

.clearfix:before,
.clearfix:after {
    content: " "; /* 1 */
    display: table; /* 2 */
}

.clearfix:after {
    clear: both;
}

/* ==========================================================================
   EXAMPLE Media Queries for Responsive Design.
   These examples override the primary ('mobile first') styles.
   Modify as content requires.
   ========================================================================== */

@media only screen and (min-width: 35em) {
    /* Style adjustments for viewports that meet the condition */
}

@media print,
       (min-resolution: 1.25dppx),
       (min-resolution: 120dpi) {
    /* Style adjustments for high resolution devices */
}

/* ==========================================================================
   Print styles.
   Inlined to avoid the additional HTTP request:
   http://www.phpied.com/delay-loading-your-print-css/
   ========================================================================== */

@media print {
    *,
    *:before,
    *:after,
    *:first-letter {
        background: transparent !important;
        color: #000 !important; /* Black prints faster: http://www.sanbeiji.com/archives/953 */
        box-shadow: none !important;
    }

    a,
    a:visited {
        text-decoration: underline!important;
    }

    a[href]:after {
        content: " (" attr(href) ")";
    }

    abbr[title]:after {
        content: " (" attr(title) ")";
    }

    /*
     * Don't show relative links
     */

    a[href^="."]:after,
    a[href^="/"]:after {
        content: "";
    }

    pre,
    blockquote {
        border: 1px solid #999;
        page-break-inside: avoid;
    }

    /*
     * Printing Tables:
     * http://css-discuss.incutio.com/wiki/Printing_Tables
     */

    thead {
        display: table-header-group;
    }

    tr,
    img {
        page-break-inside: avoid;
    }

    img {
        max-width: 100% !important;
    }

    p,
    h2,
    h3 {
        orphans: 3;
        widows: 3;
    }

    h2,
    h3 {
        page-break-after: avoid;
    }
}
`);
exports.CSSNormalize = CSSNormalize;

