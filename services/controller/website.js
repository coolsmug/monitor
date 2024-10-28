



const getIndex = async (req , res ) => {
    try {
        await res.render('website/index-2')
    } catch (err) {
        
    }
}



module.exports = {
    getIndex
}