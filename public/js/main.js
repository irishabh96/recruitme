$('document').ready(function() {
	$('.file-upload').change(function() {
		$('#profilePicUploadForm').submit();
	});
});

$('#checkboxExp1').click(function() {
	if ($(this).is(':checked')) {
		$('.expCheckSelected').show();
	} else {
		$('.expCheckSelected').hide();
	}
});

$('#showExpForm').on('click', function(event) {
	$('#toggleText1b').show();
	// show experience form
});
$('#addexperience').on('click', function(event) {
	$('#toggleText1b').show();
	$('.experience-place').hide();
});
$('#addeducation').on('click', function(event) {
	$('#toggleText101b').show();
	$('.education-place').hide();
});
$('#hideExpForm').on('click', function() {
	$('#toggleText1b').hide();
});
$('#showEduForm').on('click', function(event) {
	$('#toggleText101b').show();
	// show experience form
});
$('#hideEduForm').on('click', function() {
	$('#toggleText101b').hide();
});

$('.dataId').on('click', function() {
	var id = $(this).attr('name');
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', '/profile/experience/edit/' + id, false);
	httpRequest.send();
	var data = JSON.parse(httpRequest.responseText);
	_.templateSettings = {
		interpolate: /\{\{=(.+?)\}\}/g,
		evaluate: /\{\{(.+?)\}\}/g
	};
	var template = $('#profileEditExperience').html();
	$(this).parent().html(_.template(template)({ data: data, config: config }));
});

$('.dataId1').on('click', function() {
	var id = $(this).attr('name');
	var httpRequestEdu = new XMLHttpRequest();
	httpRequestEdu.open('GET', '/profile/education/edit/' + id, false);
	httpRequestEdu.send();
	var dataEdu = JSON.parse(httpRequestEdu.responseText);
	_.templateSettings = {
		interpolate: /\{\{=(.+?)\}\}/g,
		evaluate: /\{\{(.+?)\}\}/g
	};
	var template = $('#profileEditEducation').html();
	$(this).parent().html(_.template(template)({ dataEdu: dataEdu, config: config }));
});

function getJobData(x) {
	var jobId = x;
	var currentLocation = config.url;
	var path = window.location.pathname;
	var parts = path.split('/', 3);
	var url = parts[1] + '/' + parts[2];

	var newlocation = window.location.assign(currentLocation + '/' + url + '/' + jobId);
}

$('.editJob').on('click', function() {
	var val = $(this).attr('value');
	$.get('/profile/jobs/edit/' + val, function(data) {
		$('.modal').modal();
		$('#jobTitle').val(data.jobTitle);
		$('#jobType').val(data.jobType);
		$('#jobDescription').val(data.jobDescription);
		$('#btnAddEdit').html('Edit Job');
		$('#myModalLabel').html('Edit Job');
		$('#formAddEdit').attr('action', '/profile/jobs/edit/' + val);
	});
});
function f1(x) {
	var y = document.getElementById(x);
	var txtchange = document.getElementsByClassName(x)[0];
	$(y).toggle(function() {
		if ($(txtchange).html() == 'Show more') {
			$(txtchange).html('Show less');
		} else {
			$(txtchange).html('Show more');
		}
	});
}

$('#myModal').on('hidden.bs.modal', function() {
	$('.modal-body').find('input[type=text], textarea').val('');
	$('#btnAddEdit').html('Add Job');
	$('#myModalLabel').html('Add Job');
	$('#formAddEdit').attr('action', '/profile/jobs/add');
});
