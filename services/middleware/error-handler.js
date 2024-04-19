const { StatusCodes } = require("http-status-codes")

const errorHandlerMaiddleware = (err, req, res, next) => {
    console.log(err)
    const CustomError = {
        statusCodes: err.statusCodes || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong, try agin later"
    }

    if (err.name === "ValidationError") {
        CustomError.statusCodes = 400,
            CustomError.msg = Object.value(err.errors).map((item) => item.message).join(",")
    }

    if (err.code && err.code === 11000) {
        CustomError.statusCodes = 400,
            CustomError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`
    }
    if (err.name === "CastError") {
        CustomError.statusCodes = 404,
            CustomError.msg = `No item found with id ${err.value}`
    }

    return res.status(CustomError.statusCodes).json({ msg: CustomError.msg })
}

module.exports = errorHandlerMaiddleware;