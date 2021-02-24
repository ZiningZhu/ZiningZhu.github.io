function check_slide(speed='slow') {
    var checked = $('#show-selected input')[0].checked;
    // For unknown reason, each click triggers this listener twice. Must use slideUp / slideDown instead of slideToggle.
    if (checked) {
        $('.other').slideUp(speed);
        $('#pubs_title').text("Selected Publications")
    } else {
        $('.other').slideDown(speed);
        $('#pubs_title').text("All Publications")
    }
}
$('.select-pubs').click(check_slide);
check_slide('fast');