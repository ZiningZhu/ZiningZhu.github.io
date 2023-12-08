parse_render_pubs("all");
attach_keywords_filter();

function attach_keywords_filter() {
    render_buttons_styles("all");
    $(".filter-btn").click(event => {
        render_buttons_styles(event.target.id); // e.g., "reasoning"
        $("#display-pubs").slideUp(500, response => {
            $("#display-pubs").empty();
            parse_render_pubs(event.target.id);
            $("#display-pubs").slideDown(500);
        });
        
    });
}

function render_buttons_styles(keyword) {
    [].map.call(
        document.getElementsByClassName("filter-btn"),
        btn => {
            if (btn.id == keyword) {
                btn.style["font-weight"] = "bold";
            } else {
                btn.style["font-weight"] = "";
            }
        }
    );
}

function parse_render_pubs(keyword) {
    // This will report CORS error when testing locally, but it is allowed when deploying to the remote server.
    if (location.hostname == "") {
        console.log("Debug mode: fetching from cloudinary.");
        url = "https://res.cloudinary.com/dnijsrvoc/raw/upload/v1664823559/publications_vhght0.bib";
    } else {
        url = "publications.bib";
    }
    fetch(url)
        .then(response => response.text()) 
        .then(text => {
            var samples = bibtexParse.toJSON(text, true);
            parse_render_pubs_helper(samples, keyword);
        });
}


function parse_render_pubs_helper(samples, keyword) {
    var paper_id;
    for (paper_id=0; paper_id < samples.length; paper_id++) {
        sample = samples[paper_id];
        
        var pubitem = document.createElement("li");
        pubitem.setAttribute("class", "pubitem");
        pubitem.setAttribute("value", sample.entryTags.bibid);

        var titleline = document.createElement("b");
        titleline.innerHTML = sample.entryTags.title;
        pubitem.append(titleline);

        var author_journal_node = document.createElement("div");
        var authorline = parse_authors(sample.entryTags.author, "Zining Zhu", sample.entryTags._author_stars);
        
        var journalline = "";
        if (sample.entryType == "inproceedings") {
            journalline = sample.entryTags.booktitle;
        } else if (sample.entryType == "article") {
            journalline = sample.entryTags.journal;
        } else {
            journalline = sample.entryTags.journal;
        }
        journalline += (", " + sample.entryTags.year);
        
        author_journal_node.innerHTML = authorline + "<br />" + journalline;
        pubitem.append(author_journal_node);
        
        var buttons_node = document.createElement("div");
        if ("url" in sample.entryTags) {
            var url = document.createElement("a");
            url.setAttribute("href", sample.entryTags.url);
            url.setAttribute("target", "_blank");
            url.innerHTML = "[paper] ";
            buttons_node.append(url);
        }
        if ("blog" in sample.entryTags) {
            var blog = document.createElement("a");
            blog.setAttribute("href", sample.entryTags.blog);
            blog.setAttribute("target", "_blank");
            blog.innerHTML = "[blog] ";
            buttons_node.append(blog);
        }
        if ("abstract" in sample.entryTags) {
            var abstract_btn = document.createElement("a");
            abstract_btn.setAttribute("id", paper_id);
            abstract_btn.onclick = onclick_abstract_listener;
            abstract_btn.innerHTML = "[abstract]";
            buttons_node.append(abstract_btn);
            var abstract = document.createElement("div");
            abstract.setAttribute("class", "abstract");
            abstract.style.display = "none";
            var keywords = sample.entryTags.keywords.split(",").map(s => s.trim());
            if ((keyword!="all") && !keywords.includes(keyword)) continue 
            else {
                abstract.append(parse_abstract_and_keywords(sample.entryTags.abstract, sample.entryTags.keywords));
                buttons_node.append(abstract);
            }
        } else continue;
        pubitem.append(buttons_node);
        //console.dir(pubitem);
        $('#display-pubs').append(pubitem);
    }
}

function parse_abstract_and_keywords(abstract_str, keywords_str) {
    var abs_div = document.createElement("div");
    abs_div.innerHTML = abstract_str;
    var keyword_div = document.createElement("div");
    var keyword_head = document.createElement("b");
    keyword_head.innerHTML = "Keywords: ";
    keyword_div.append(keyword_head);
    var keywords_list = keywords_str.split(",")
    var i;
    for (i=0; i<keywords_list.length; i++) {
        tn = keywords_list[i].trim();
        if (i < keywords_list.length-1) {
            tn += ", ";
        }
        keyword_div.append(document.createTextNode(tn));
    }
    
    abs_div.append(keyword_div);
    return abs_div;
}


function onclick_abstract_listener(event) {
    var publist = $(".pubitem");
    $header = $(this);  // the "abstract" btn clicked
    $content = $header.next();  // The "abstract & keywords" div follows the abstract btn
    $content.slideToggle(500);  // This removes the "display:none;" style slowly
}


function parse_authors(author_line, highlight, author_stars) {
    // Input example: "Last1, First1 and Last2, First2"
    // Output example: "First1 Last1, First2 Last2", with highlights
    var result = "";
    var authors = author_line.split("and");
    var i;
    for (i=0; i < authors.length; i++) {
        var firstlast = authors[i].split(",")
        var last = firstlast[0].trim();
        var first = firstlast[1].trim();
        var author_parsed = first + " " + last;
        if (author_parsed == highlight) {
            author_parsed = "<u>" + author_parsed + "</u>";
        }
        result = result + author_parsed
        if (author_stars && author_stars.indexOf(i) > -1) {
            // If there is no "_author_stars" entry: author_stars is just undefined.
            result = result + "*";
        }
        if (i < authors.length-1) {
            result = result + ", ";
        } else {
            result = result + ". ";
        }
    }
    return result;
}