const upper_letters = get_array(65, 90);
const lower_letters = get_array(97, 122);
const numbers = get_array(48, 57);
const special_characters = get_array(35, 38).concat(
    get_array(58, 64)
).concat(
    get_array(91, 95)
).concat(
    get_array(123, 126)
).concat(
    get_array(40, 47)
);

function get_array(low, high) {
    const arr = [];
    for(let i = low; i < high + 1; i++) {
        var letter = String.fromCharCode(i);
        arr.push(letter);
    }

    return arr;
};



function getPassword(size) {
    const charaArray = upper_letters.concat(special_characters).concat(lower_letters).concat(numbers);
    const password = [];
    for(let i = 0 ; i < size; i++) {
        const char = charaArray[Math.floor(Math.random() * charaArray.length)];
        password.push(char);
    }

    return password.join('')
}


console.log(getPassword(20));