// ==UserScript==
// @name        SSC comment navigation
// @description Adds navigation buttons to comments on Slate Star Codex
// @version     1
// @grant       none
// @include     http://slatestarcodex.com/*/*/*/*
// ==/UserScript==


// *************
// ** Generic **
// *************

// Creates an link to the specified href and adds the specified text (as text
// content) and content (as child node).
function createLink(href, text, content) {
  var a = document.createElement('a');
  a.href = href;
  
  if (text)
    a.textContent = text;

  if (content)
    a.appendChild(content);
  
  return a;
}


// ************
// ** Lookup **
// ************


// Finds out whether a node is a comment. Any <li> element with class "comment"
// is considered a comment.
function nodeIsComment(node) {
  if (node)
    return node.tagName == "LI" && node.classList.contains("comment");
  else
    return false;
}

function getCommentId(comment) {
  var holder = comment.querySelector('div.commentholder');
  return holder.id;
}

function getNext(comment) {
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

function getParent(comment) {
  if (!comment)
    return null;

  var node = comment.parentNode.parentNode;
  if (nodeIsComment(node)) {
    return node;
  } else {
    return null;
  }
}

function getSkip(comment) {
  node = comment;

  while(node) {
    next = getNext(node);
    
    if (next)
      return next;
    
    node = getParent(node);
  }
  
  return null;
}


// ******************
// ** Manipulation **
// ******************

function createNavLink(comment, text, content) {
  var link = createLink("#" + getCommentId(comment), text, content);
  link.style.width = "40px";
  link.style.height = "40px";
  link.style.display = "block";
  return link;
}

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

const arrowPath = "M20,37.5 l15,-15 h-10 v-20 h-10 v20 h-10 l15,15 z";

function addNav(comment) {
  // Get related items
  var parent = getParent(comment);
  var skip   = getSkip  (comment);

  // Build the navigation links
  var navlinks = document.createElement ("div");
  navlinks.style.position = "absolute";
  navlinks.style.left = "5px";
  navlinks.style.top  = "44px";

  var parentImage = createSvg("Skip", "black", arrowPath, "rotate(90 20 20)");
  var skipImage   = createSvg("Skip", "black", arrowPath, "rotate( 0 20 20)");

  if (parent) navlinks.appendChild (createNavLink(parent, "", parentImage));
  if (skip)   navlinks.appendChild (createNavLink(skip  , "", skipImage  ));
  

  // Add the navigation links
  var vcard = comment.querySelector('div.vcard');
  vcard.appendChild(navlinks); 
}

function addNavAll() {
  // Iterate over all comments
  var comments = document.querySelectorAll('li.comment');
  for (var i = 0 ; i < comments.length; i++) {
    addNav (comments[i]);
  }
}

addNavAll();

