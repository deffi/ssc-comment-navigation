// ==UserScript==
// @name        SSC comment navigation
// @description Adds navigation buttons to comments on Slate Star Codex
// @version     1
// @grant       none
// @include     http://slatestarcodex.com/*/*/*/*
// @include     https://slatestarcodex.com/*/*/*/*
// ==/UserScript==


// *************
// ** Generic **
// *************

// Creates an link to the specified href with the specified class and adds
// the specified text (as text content) and content (as child node).
function createLink(href, className, text, content) {
  var a = document.createElement('a');
  a.href = href;
  a.className = className;
  
  if (text)
    a.textContent = text;

  if (content)
    a.appendChild(content);
  
  return a;
}


// ************
// ** Lookup **
// ************

// Determines whether a node is a comment. Any <li> element with class
// "comment" is considered a comment.
//
// If node is null, false is returned.
function nodeIsComment(node) {
  if (node)
    return node.tagName == "LI" && node.classList.contains("comment");
  else
    return false;
}

// Finds and returns the element ID for a given comment (which must be valid).
//
// The element ID is the ID of the element where a navigation link to this
// comment should jump to.
//
// The comment argument must refer to a valid comment (cf. nodeIsComment).
function getCommentId(comment) {
  // Each comment has a <div> with class "commentholder" as a child, which
  // contains the content of the comment.
  var holder = comment.querySelector('div.commentholder');
  return holder.id;
}

// Finds and returns the next sibling of a given comment (i. e. the next reply
// to the same parent comment).
//
// If the comment argument is null or the comment does not have a next sibling,
// null is returned.
function getNext(comment) {
  if (!comment)
    return null;

  // The next comment is found by the next sibling node with class "comment".
  // There may be non-comment siblings between comments.

  // Consider the next sibling of the comment in question.
  var node = comment.nextElementSibling;
  while (node) {
    // If it is a comment, return it.
    if (nodeIsComment (node))
      return node;

    // Next sibling
    node = node.nextElementSibling;
  }

  // No sibling found
  return null;
}

// Finds and returns the parent of a given comment (i. e. the comment that this
// comment is a reply to).
//
// If the comment argument is null or the comment does not have a parent, null
// is returned.
function getParent(comment) {
  if (!comment)
    return null;

  // The parent comment should be the parent nodes' parent node.
  var node = comment.parentNode.parentNode;
  if (nodeIsComment(node)) {
    // The parent node is a comment. Return it.
    return node;
  } else {
    // The parent node is not a comment, which means that this comment has no
    // parent. Return null.
    return null;
  }
}

// Get the next comment that is not part of the subthread starting at a given
// comment.
//
// If the comment argument is null or there are no more comments that are not
// part of the subthread starting at the comment, null is returned.
function getSkipTarget(comment) {
  if (!comment)
    return null;

  // Start at the current comment
  node = comment;

  while(node) {
    // If there is a next sibling, return it.
    next = getNext(node);
    if (next)
      return next;
    
    // There is no next sibling. Retry at the parent comment.
    node = getParent(node);
  }
  
  return null;
}


// ******************
// ** Manipulation **
// ******************

// Creates a navigation link, i. e. a link to the specified comment with the
// specified text and content (cf. createLink).
function createNavLink(comment, className, text, content) {
  var link = createLink("#" + getCommentId(comment), className, text, content);
  link.style.width = "40px";
  link.style.height = "40px";
  link.style.display = "block";
  return link;
}

// Creates an SVG node containing a single path, an optional transform and a
// title text.
function createSvg(titleText, color, pathD, transform) {
  var svgNs = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(svgNs, "svg");
  svg.setAttributeNS(null, "viewBox", "0 0 40 40");
  svg.setAttributeNS(null, "height", "40px");
  svg.setAttributeNS(null, "width" , "40px");
  var path = document.createElementNS(svgNs, "path");
  path.setAttributeNS(null, "d", pathD);
  path.setAttributeNS(null, "stroke", color);
  path.setAttributeNS(null, "strokeWidth", "2");
  path.setAttributeNS(null, "fill", "none");
  if (transform)
    path.setAttributeNS(null, "transform", transform);
  var title = document.createElementNS(svgNs, "title");
  title.textContent = titleText;
  svg.appendChild(title);
  svg.appendChild(path);
  svg.style.display = "block";
  return svg;
}

// The path that describes the navigation arrow.
const arrowPath = "M20,37.5 l15,-15 h-10 v-20 h-10 v20 h-10 l15,15 z";

// Adds navigation links to the specified comment.
function addNav(comment) {
  // Get targets
  var parent = getParent    (comment);
  var skip   = getSkipTarget(comment);

  // Create the <div> for the navigation links
  var navlinks = document.createElement ("div");
  navlinks.className = "navigation-links";
  navlinks.style.position = "absolute";
  navlinks.style.left = "5px";
  navlinks.style.top  = "44px";

  // Create the SVGs
  var parentImage = createSvg("Skip", "black", arrowPath, "rotate(90 20 20)");
  var skipImage   = createSvg("Skip", "black", arrowPath, "rotate( 0 20 20)");

  // Add the links to the <div>
  if (parent) navlinks.appendChild (createNavLink(parent, "parent", "", parentImage));
  if (skip)   navlinks.appendChild (createNavLink(skip  , "skip"  , "", skipImage  ));

  // Add the <div> with the navigation links to the comment
  var vcard = comment.querySelector('div.vcard');
  vcard.appendChild(navlinks); 
}

// Adds navigation links (cf. addNav) to all comments.
function addNavAll() {
  // Iterate over all comments (cf. nodeIsComment)
  var comments = document.querySelectorAll('li.comment');
  for (var i = 0 ; i < comments.length; i++) {
    addNav (comments[i]);
  }
}

addNavAll();

