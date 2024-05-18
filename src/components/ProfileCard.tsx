import Image from 'next/image';
import { FaHome } from "react-icons/fa";


interface ProfileCardProps {
    image: string|any;
    name: string;
    title: string;
    period: string;
    interest: string;
    email: string;
    homepage: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ image, name, title, period, interest, email, homepage }) => {
    const IMAGE = `${image}` || "/members/ku_basic_1_down.png"


    // sm(640px)  : 핸드폰        / 1-col 세로 프로필 (W 320px(사진 256px) )        / 사진 8:9
    // md(768px)  : 아이패드 미니 / 1-col 가로 프로필 (W 600px(사진 240px) H 270px) /
    // lg(1024px) : 아이패드 프로 / 2-col 가로 프로필 (W 600px(사진 240px) H 270px) /
    // xl(1280px) : 데스크탑      / 2-col 가로 프로필 (W 600px(사진 240px) H 270px) /
    return (
        <div className="flex flex-col w-[320px]
                        sm:flex-row sm:aspect-[20/9] sm:w-full sm:max-w-[600px]
                        lg:max-w-full
                        bg-[#f7f8fa] shadow-lg rounded-xl mx-auto
                        hover:scale-105 transform transition-transform duration-300 ease-in-out">

            {/* ####################################### */}
            {/* ####### 세로 프로필 (사진 8:9) ######## */}
            {/* ####################################### */}
            <div className="block sm:hidden mx-8 mt-4 mb-2">
                <div className="aspect-[8/9] relative">
                    <Image src={IMAGE} alt={name} layout="fill" className="h-full w-full object-cover" />
                </div>
            </div>

            {/* ####################################### */}
            {/* ######### 가로 프로필 (40:60) ######### */}
            {/* ####################################### */}
            <div className="hidden sm:block sm:w-[40%] bg-white">
                <Image src={IMAGE} alt={name} width={200} height={200} className="h-full w-full object-cover" />
            </div>

            {/* ####################################### */}
            {/* #############    디테일   ############# */}
            {/* ####################################### */}
            <div className="w-full sm:w-[60%]
                            pt-2 pb-4 px-6 sm:p-6 lg:py-3 lg:pl-4 lg:pr-2 xl:p-6">
                <div className="flex items-center gap-2">
                    <p className="text-[22px] font-semibold">{name}</p>
                    {homepage && (
                        <a href={homepage} target="_blank" className=" hover:text-green-900">
                            <FaHome className="inline-block h-5 w-5 pb-0.5"/>
                        </a>
                        )}
                </div>
                <p>{title}</p>
                <div className="tracking-[-0.01em] text-[#555] text-[14.5px] sm:text-[15.5px] lg:text-[15px] xl:text-[16px]">
                    <p> {period}</p>
                    <p><span>Topic:</span> {interest}</p>
                    <p><span>Email:</span> {email}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
