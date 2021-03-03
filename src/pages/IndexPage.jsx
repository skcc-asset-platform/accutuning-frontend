import React from 'react';


export default () => {
    return (
        <div className="index">
            <div className="wrapper">
                <main>
                    <div className="container">
                        <strong className="tit_index"><span className="txt_emph txt_red">Accu.Tuning</span>과 함께 코딩 없이도 <br />자동으로
                            최적의 <span className="txt_emph">머신러닝 모델</span>을 찾아보세요. </strong>
                        <p className="txt_index">
                            데이터 분석 전문가가 아니더라도 사용할 수 있는 Accu.Tuning를 통해 다양한 알고리즘과 <br />
                            하이퍼파라미터를 빠르게 적용해볼 수 있습니다. <br />
                            복잡한 데이터 분석에 소요되는 시간은 줄이고, 분석 성능은 높여보세요. <br />
                            TPOT, Auto-sklearn 등 다양한 오픈소스 AutoML 프레임워크를 교차 활용하여 그 성능을 높이고, <br />
                            다양한 산업군과 회귀·분류 등 어느 예측 목적에도 적용 가능합니다. 분석이 끝난 모델도 <br />
                            AccuInsight+나 Scikit-Learn 등으로 빠르게 배포하여, 쉽게 가공하고 활용할 수 있습니다. <br />
                            데이터 분석의 시작부터 끝까지, Accu.Tuning와 함께 지금 바로 시작해보세요!
                        </p>
                        <a href='/'>
                            <button className="btn_b btn_start">시작하기</button>
                        </a>

                        <ul className="list_info">
                            <li>
                                Preprocessor 기능을 통해 내 데이터에서 결측값 처리, <br />
                                라벨링 등 복잡한 전처리 과정을 간편하게 처리하고 AutoML에 맞는 <br />
                                데이터셋을 자동으로 구성해보세요.
                            </li>
                            <li>
                                정의한 문제에 따라 TPOT, Auto-sklearn 등 오픈소스 AutoML <br />
                                프레임워크를 이용한 최적의 모델과 하이퍼파라미터를 찾고, <br />
                                API를 통해 AccuInsight+ 등으로 바로 배포할 수 있습니다.
                            </li>
                            <li>
                                구성된 머신러닝 모델들의 성능을 다양한 지표로 비교하여 <br />
                                최적의 모델을 선정하고, 설명 가능한 AI 기술을 통해 <br />
                                내 모델의 의미가 무엇인지 파악할 수 있도록 합니다.
                            </li>
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    )
}
