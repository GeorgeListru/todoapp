export default function FormatDate(inputDate) {
	const date = new Date(inputDate);
	const day = date.getDate();
	const month =
		date.getMonth().toString().length === 1
			? ("0" + (date.getMonth() + 1)).trim()
			: (date.getMonth() + 1).toString().trim();
	const year = date.getFullYear();
	if (year === 1970) return "";
	return day + "/" + month + "/" + year;
}
