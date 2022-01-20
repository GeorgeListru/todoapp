export default function FormatFileName(fullpath, split_element) {
	const nameComponents = fullpath.split(split_element);
	const fullName = nameComponents[nameComponents.length - 1].split(".");
	let extension = fullName[fullName.length - 1];
	fullName.pop(fullName.length - 1);
	let name = fullName.toString();
	if (name.length > 20) {
		name = name.slice(0, 20) + "...";
	}
	if (extension.length > 8) {
		extension = extension.slice(0, 8) + "...";
	}

	return name + "." + extension;
}
