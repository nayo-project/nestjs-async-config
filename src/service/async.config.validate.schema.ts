export const updateConfigValidateSchema = {
    doc: {
        custom: {
            options: (value, {req, location, path}) => {
                if (Object.prototype.toString.call(value) === '[object Object]') {
                    return true;
                } else {
                    return false;
                }
            }
        },
    },
};

export const deleteConfigValidateSchema = {
    key: {
        isString: true,
    },
};

export const getConfigValidateSchema = {
    key: {
        in: ['param'],
        isString: true,
    },
};
