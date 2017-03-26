
//Global variables
var qtdSteps = 1;

/**
This functions addeds a new input on steps section
*/
function addStep(){

	qtdSteps++;
	var newInputIdName = 'stepbystep_' + qtdSteps;
	var placeholder = 'Step ' + qtdSteps;

	$('<input>').attr({
		type: 'text',
		id: newInputIdName,
		name: newInputIdName,
		class: 'form-control',
		placeholder: placeholder
	}).appendTo('#stepsFields');

	checkRemoveStepDisplay();
}

/**
This function romoves the last step inserted
*/
function removeStep(){
	$("#stepsFields input:last-child").remove();
	qtdSteps--;
	checkRemoveStepDisplay();
}

/**
This function verifies if the system must display the
remove step button. This button will only be shown if there is
more than one step.
*/
function checkRemoveStepDisplay(){
	if(qtdSteps > 1){
		$('#removeStepBtn').show();
	} else {
		$('#removeStepBtn').hide();
	}
}

/**
This function verifies if the Ticket Resolution Form is valid
*/
function validateTicketResolutionForm(){
	var fieldsToValidate = ['integrationName', 'ticket', 'subject', 'description', 'resolution'];
	var isValid = basicFormValidation(fieldsToValidate);

	if(isValid){
		//TODO call submit function
	}
}

/**
* This function verifies if the informed input fields are empty.
* Param = array with input field's id
*
* */
function basicFormValidation(inputFields){
	var isValid = true;
	var errors = new Array();
	var field;

	for(i = 0; i < inputFields.length; i++){
		field = $('#' + inputFields[i]);
		if ($(field).val() == "") {
			$(field).closest("div.form-group").addClass("has-error");
			errors.push("The field " + $(field).closest("div.form-group").find('label').text() + " is mandatory");
		} else{
			$(field).closest("div.form-group").removeClass("has-error");
		}
	}

	dateField = $('#resolutionDate');
	if(!isDate($(dateField).val())){
		$(dateField).closest("div.form-group").addClass("has-error");
		errors.push("The field " + $(dateField).closest("div.form-group").find('label').text() + " is mandatory and must have the mm/dd/yyyy format.");
	} else {
		$(dateField).closest("div.form-group").removeClass("has-error");
	}

	//If there is a content on errors' array
	if (errors.length > 0) {
		isValid = false;
		$('#errorAlert').show();
		$('#errorAlert').empty();
		$('html, body').animate({ scrollTop: 0 }, 'fast');

		//Adding error messages
		for (i = 0; i < errors.length; i++) {
			$('#errorAlert').append("<p>" + errors[i] +"</p>");
		}

	} else {

		$('#errorAlert').hide();
	}

	return isValid;
}

/**
	This functions validates a given text, verifying the date format mm/dd/yyyy.
*/
function isDate(txtDate){

	var currVal = txtDate;
	if(currVal == '')
		return false;

	//Declare Regex
	var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
	var dtArray = currVal.match(rxDatePattern); // is format OK?
	if (dtArray == null)
		return false;

	//Checks for mm/dd/yyyy format.
	dtMonth = dtArray[1];
	dtDay= dtArray[3];
	dtYear = dtArray[5];

	if (dtMonth < 1 || dtMonth > 12)
		return false;

	else if (dtDay < 1 || dtDay> 31)
		return false;

	else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31)
		return false;

	else if (dtMonth == 2){
		var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
		if (dtDay> 29 || (dtDay ==29 && !isleap))
			return false;
	}

	return true;
}
