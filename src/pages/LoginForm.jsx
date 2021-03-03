import React from 'react';
import { connect } from 'react-redux';
import { loginUser, changePassword } from '../actions/login'
import { useForm } from "react-hook-form";

const mapStateToProps = (state) => {
    return ({
        loginData: state.login,
        currentUser: state.user,
    })
};

export default connect(mapStateToProps, null)(({loginData, currentUser, dispatch}) => {
    const { handleSubmit, errors, register, formState } = useForm();
    // useEffect(
    //     () => {
    //         dispatch(refreshSources())
    //         // dispatch(refreshWorkspace())
    //     }
    // )
    function validateEmpty(value) {
        let error;
        if (!value) {
            error = "This field is required";
        }
        // console.log(error)
        return error || true;
    }

    function onSubmit(values) {
        // setTimeout(() => {
        //   alert(JSON.stringify(values, null, 2));
        // }, 1000);
        // console.log(values)
        dispatch(loginUser(values))
    }

    function onSubmitToChangePassword(values) {
        // setTimeout(() => {
        //   alert(JSON.stringify(values, null, 2));
        // }, 1000);
        // console.log(values)
        dispatch(changePassword(values))
    }

    // console.log(loginData)
    return (
        <div className="login">
            <div className="wrap_login">
                <div className="info_login">
                    <strong>Welcome to <span className="txt_emph">Accu.Tuning</span></strong>
                    Sign in to your account
                </div>
                {currentUser.data && currentUser.data.username ?
                    <form className="form_login" onSubmit={handleSubmit(onSubmitToChangePassword)}>
                        <fieldset>
                            <legend className="screen_out">change password</legend>
                            <h4>Almost done. you have to change your password</h4>
                            <input
                                type="password"
                                className="inp_txt"
                                name="password"
                                placeholder="password"
                                ref={register({ validate: validateEmpty })}
                            />
                            {errors.password && errors.password.message}
                            <input
                                type="password"
                                className="inp_txt"
                                name="password_match"
                                placeholder="password to confirm"
                                ref={register({ validate: validateEmpty })}
                            />
                            {errors.password_match && errors.password_match.message}
                            <button type="submit" className="btn_login" disabled={formState.isSubmitting}>Change</button>
                                {loginData.error ?
                                    <div style={{color: 'red'}}>
                                        Failed to change. {loginData.error.map(e => <span>{e}</span>)}
                                    </div>
                                    : null
                                }
                        </fieldset>
                    </form>
                    :
                    <form className="form_login" onSubmit={handleSubmit(onSubmit)}>
                        <fieldset>
                            <legend className="screen_out">login form</legend>
                            <input type="text"  className="inp_txt"
                                    name="username"
                                    placeholder="username"
                                    ref={register({ validate: validateEmpty })}
                            />
                            {errors.username && errors.username.message}
                            <input
                                type="password"
                                className="inp_txt"
                                name="password"
                                placeholder="password"
                                ref={register({ validate: validateEmpty })}
                            />
                            {errors.password && errors.password.message}
                            <button type="submit" className="btn_login" disabled={formState.isSubmitting}>Sign in</button>
                            {loginData.error ?
                                <div style={{color: 'red'}}>
                                    Failed to sign in
                                </div>
                                : null
                            }
                            {/* <a href="#none" className="link_forget">Forgot ID/password?</a> */}
                        </fieldset>
                    </form>
                }
            </div>
        </div>
)
})